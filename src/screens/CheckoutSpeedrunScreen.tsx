import { useEffect, useMemo, useState } from "react";
import { Button, Card, Pill, ScreenTitle, Segmented } from "../components/ui";
import {
  CheckoutSpeedrunSession,
  CheckoutRangeKey,
  SpeedrunEntryResult,
  SpeedrunOrder,
  UserSettings
} from "../types/models";
import {
  CHECKOUT_RANGE_PRESETS,
  listPlayableCheckoutNumbers,
  normalizeCheckoutRangeKey,
  sanitizeCheckoutCustomRange
} from "../utils/constants";
import {
  getPrimaryCheckoutRoute
} from "../utils/checkoutLibrary";
import { CheckoutRouteSummary } from "../features/checkout-engine/RouteSummary";
import { triggerHaptic } from "../utils/haptics";
import { formatClock, formatPracticeDuration, toRoundedSeconds } from "../utils/time";
import { useI18n } from "../i18n";

interface RunningState {
  list: number[];
  index: number;
  entries: { checkout: number; seconds: number; result: SpeedrunEntryResult }[];
  startedAt: number;
  currentCheckoutStartedAt: number;
  pauseStartedAt: number | null;
  pauseMs: number;
  rangeStart: number;
  rangeEnd: number;
  rangeLabel: string;
  order: SpeedrunOrder;
}

function shuffle(values: number[]): number[] {
  const next = [...values];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function getSuccessRate(entries: { result: SpeedrunEntryResult }[]): number {
  if (!entries.length) {
    return 0;
  }
  const finished = entries.filter((entry) => entry.result === "finished").length;
  return (finished / entries.length) * 100;
}

export function CheckoutSpeedrunScreen({
  onBack,
  onSaveSession,
  previousSessions,
  settings
}: {
  onBack: () => void;
  onSaveSession: (session: CheckoutSpeedrunSession) => void;
  previousSessions: CheckoutSpeedrunSession[];
  settings: UserSettings;
}) {
  const { t } = useI18n();
  const [preset, setPreset] = useState<CheckoutRangeKey>("61-70");
  const [customStart, setCustomStart] = useState("61");
  const [customEnd, setCustomEnd] = useState("70");
  const [order, setOrder] = useState<SpeedrunOrder>("sequential");
  const [running, setRunning] = useState<RunningState | null>(null);
  const [showRoute, setShowRoute] = useState(true);
  const [ticker, setTicker] = useState(Date.now());
  const [result, setResult] = useState<CheckoutSpeedrunSession | null>(null);
  const [pbDelta, setPbDelta] = useState<number | null>(null);

  useEffect(() => {
    if (!running) {
      return;
    }
    const timer = window.setInterval(() => setTicker(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const selectedPreset = useMemo(
    () => CHECKOUT_RANGE_PRESETS.find((item) => item.key === preset) ?? CHECKOUT_RANGE_PRESETS[0],
    [preset]
  );
  const customRange = useMemo(
    () => sanitizeCheckoutCustomRange(Number(customStart), Number(customEnd)),
    [customStart, customEnd]
  );
  const activeRange = preset === "custom" && customRange
    ? { label: `${customRange.min}-${customRange.max}`, min: customRange.min, max: customRange.max }
    : selectedPreset;

  const currentCheckout = running ? running.list[running.index] : null;
  const primaryRoute = currentCheckout ? getPrimaryCheckoutRoute(currentCheckout, settings.preferredDouble) : null;

  const activeTotalSeconds = running
    ? toRoundedSeconds((ticker - running.startedAt - running.pauseMs - (running.pauseStartedAt ? ticker - running.pauseStartedAt : 0)))
    : 0;
  const currentCheckoutSeconds = running
    ? toRoundedSeconds(
        ticker -
          running.currentCheckoutStartedAt -
          (running.pauseStartedAt ? ticker - running.pauseStartedAt : 0)
      )
    : 0;

  const resultFastest =
    result?.entries.reduce<{ checkout: number; seconds: number } | null>((best, entry) => {
      if (!best || entry.seconds < best.seconds) {
        return { checkout: entry.checkout, seconds: entry.seconds };
      }
      return best;
    }, null) ?? null;
  const resultSlowest =
    result?.entries.reduce<{ checkout: number; seconds: number } | null>((worst, entry) => {
      if (!worst || entry.seconds > worst.seconds) {
        return { checkout: entry.checkout, seconds: entry.seconds };
      }
      return worst;
    }, null) ?? null;

  const start = () => {
    if (preset === "custom" && !customRange) {
      return;
    }
    const rangeStart = activeRange.min;
    const rangeEnd = activeRange.max;
    const base = listPlayableCheckoutNumbers(rangeStart, rangeEnd);
    if (base.length === 0) {
      return;
    }
    const list = order === "random" ? shuffle(base) : base;
    const now = Date.now();
    setResult(null);
    setPbDelta(null);
    setRunning({
      list,
      index: 0,
      entries: [],
      startedAt: now,
      currentCheckoutStartedAt: now,
      pauseStartedAt: null,
      pauseMs: 0,
      rangeStart,
      rangeEnd,
      rangeLabel: activeRange.label,
      order
    });
  };

  const finalizeSession = (state: RunningState, entries: RunningState["entries"], now: number) => {
    const totalActive = toRoundedSeconds(
      now -
        state.startedAt -
        state.pauseMs -
        (state.pauseStartedAt ? now - state.pauseStartedAt : 0)
    );
    const session: CheckoutSpeedrunSession = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      rangeLabel: state.rangeLabel,
      rangeStart: state.rangeStart,
      rangeEnd: state.rangeEnd,
      order: state.order,
      entries,
      totalActiveSeconds: totalActive,
      pauseSeconds: toRoundedSeconds(
        state.pauseMs + (state.pauseStartedAt ? now - state.pauseStartedAt : 0)
      )
    };
    const comparable = previousSessions
      .filter((item) => item.rangeLabel === session.rangeLabel)
      .map((item) => item.totalActiveSeconds);
    if (comparable.length > 0) {
      setPbDelta(totalActive - Math.min(...comparable));
    }
    onSaveSession(session);
    setResult(session);
    setRunning(null);
  };

  const finishEntry = () => {
    if (!running) {
      return;
    }
    const now = Date.now();
    const checkoutSeconds = toRoundedSeconds(now - running.currentCheckoutStartedAt);
    const nextEntries = [
      ...running.entries,
      { checkout: running.list[running.index], seconds: checkoutSeconds, result: "finished" as const }
    ];
    triggerHaptic(settings.vibrationFeedback);
    const nextIndex = running.index + 1;
    if (nextIndex >= running.list.length) {
      finalizeSession(running, nextEntries, now);
      return;
    }
    setRunning({
      ...running,
      entries: nextEntries,
      index: nextIndex,
      currentCheckoutStartedAt: now
    });
  };

  const togglePause = () => {
    if (!running) {
      return;
    }
    if (!running.pauseStartedAt) {
      setRunning({ ...running, pauseStartedAt: Date.now() });
      return;
    }
    const now = Date.now();
    const pausedFor = now - running.pauseStartedAt;
    setRunning({
      ...running,
      pauseStartedAt: null,
      pauseMs: running.pauseMs + pausedFor,
      currentCheckoutStartedAt: running.currentCheckoutStartedAt + pausedFor
    });
  };

  const endRun = () => {
    if (!running) {
      return;
    }
    const now = Date.now();
    if (running.entries.length === 0) {
      setRunning(null);
      return;
    }
    finalizeSession(running, running.entries, now);
  };

  return (
    <div className="screen screen-speedrun">
      <ScreenTitle title={t.checkoutTimedRun.title} subtitle={t.checkoutTimedRun.subtitle} onBack={onBack} />

      {!running && !result ? (
        <Card>
          <h3>{t.checkoutTimedRun.setup}</h3>
          <Segmented
            value={preset}
            options={CHECKOUT_RANGE_PRESETS.map((option) => ({ label: option.label, value: option.key }))}
            onChange={(value) => setPreset(normalizeCheckoutRangeKey(String(value)))}
          />
          {preset === "custom" ? (
            <div className="row">
              <input
                className="text-input"
                inputMode="numeric"
                value={customStart}
                onChange={(event) => setCustomStart(event.target.value)}
                placeholder="From (61-170)"
              />
              <input
                className="text-input"
                inputMode="numeric"
                value={customEnd}
                onChange={(event) => setCustomEnd(event.target.value)}
                placeholder="To (61-170)"
              />
            </div>
          ) : null}
          {preset === "custom" && !customRange ? (
            <p className="warn-text top-gap">Custom range must be 61-170 and From must be less than or equal to To.</p>
          ) : null}
          <div className="top-gap">
            <label>{t.checkoutTimedRun.order}</label>
            <Segmented
              value={order}
              options={[
                { label: t.checkoutTimedRun.sequential, value: "sequential" },
                { label: t.checkoutTimedRun.random, value: "random" }
              ]}
              onChange={setOrder}
            />
          </div>
          <div className="top-gap">
            <Button full onClick={start} disabled={preset === "custom" && !customRange}>
              {t.checkoutTimedRun.startTimedRun}
            </Button>
          </div>
        </Card>
      ) : null}

      {running ? (
        <Card className="practice-card">
          <div className="practice-header">
            <Pill tone="neutral">{running.rangeLabel}</Pill>
            <Pill tone="neutral">
              {running.index + 1}/{running.list.length}
            </Pill>
          </div>
          <p className="big-number">{`${t.checkoutTimedRun.currentCheckout}: ${currentCheckout}`}</p>
          <div className="metric-grid">
            <div>
              <p className="muted">{t.checkoutTimedRun.totalTime}</p>
              <strong>{formatClock(activeTotalSeconds)}</strong>
            </div>
            <div>
              <p className="muted">{t.checkoutTimedRun.currentCheckout}</p>
              <strong>{formatPracticeDuration(currentCheckoutSeconds)}</strong>
            </div>
          </div>

          {showRoute && currentCheckout ? (
            <div className="route-box">
              <h4>{t.checkoutTimedRun.route}</h4>
              <CheckoutRouteSummary finish={currentCheckout} preferredDouble={settings.preferredDouble} compact />
              {primaryRoute?.note ? <p className="muted">{primaryRoute.note}</p> : null}
            </div>
          ) : null}

          <div className="action-grid action-grid-vertical">
            <Button variant="success" onClick={finishEntry}>
              {t.common.ready.toUpperCase()}
            </Button>
            <Button variant="secondary" onClick={togglePause}>
              {running.pauseStartedAt ? t.common.resume.toUpperCase() : t.common.pause.toUpperCase()}
            </Button>
            <Button variant="danger" onClick={endRun}>
              {t.checkoutTimedRun.endRun.toUpperCase()}
            </Button>
            <Button variant="ghost" onClick={() => setShowRoute((prev) => !prev)}>
              {showRoute ? t.checkoutTimedRun.hideRoute.toUpperCase() : t.checkoutTimedRun.showRoute.toUpperCase()}
            </Button>
          </div>
        </Card>
      ) : null}

      {result ? (
        <Card>
          <h3>{t.checkoutTimedRun.result}</h3>
          <p className="big-number">{formatPracticeDuration(result.totalActiveSeconds)}</p>
          <p className="muted">
            Completed: {result.entries.filter((entry) => entry.result === "finished").length} /{" "}
            {running ? running.list.length : result.rangeEnd - result.rangeStart + 1}
          </p>
          <p className="muted">{t.checkoutTimedRun.successRate}: {getSuccessRate(result.entries).toFixed(1)}%</p>
          <p className="muted">{t.checkoutTimedRun.pauseTime}: {formatClock(result.pauseSeconds)}</p>
          {resultFastest ? (
            <p className="muted">
              {t.checkoutTimedRun.fastestCheckout}: {resultFastest.checkout} ({formatPracticeDuration(resultFastest.seconds)})
            </p>
          ) : null}
          {resultSlowest ? (
            <p className="muted">
              {t.checkoutTimedRun.slowestCheckout}: {resultSlowest.checkout} ({formatPracticeDuration(resultSlowest.seconds)})
            </p>
          ) : null}
          {pbDelta !== null ? (
            <p className={pbDelta <= 0 ? "good-text" : "warn-text"}>
              {pbDelta <= 0 ? "New personal best!" : `PB diff: +${formatPracticeDuration(pbDelta)}`}
            </p>
          ) : null}

          <div className="breakdown-list">
            {result.entries.map((entry, index) => (
              <div key={`${entry.checkout}-${index}`} className="breakdown-item">
                <span>{entry.checkout}</span>
                <span>{entry.result.toUpperCase()}</span>
                <strong>{formatPracticeDuration(entry.seconds)}</strong>
              </div>
            ))}
          </div>
          <div className="top-gap">
            <Button full onClick={() => setResult(null)}>
              {t.checkoutTimedRun.newTimedRun}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
