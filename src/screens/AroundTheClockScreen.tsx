import { useEffect, useState } from "react";
import { AroundClockSession, AroundClockMode, UserSettings } from "../types/models";
import { Button, Card, Pill, ScreenTitle, Segmented } from "../components/ui";
import { estimateDartsFromActiveTime } from "../utils/pace";
import { triggerHaptic } from "../utils/haptics";
import { formatClock, formatPracticeDuration, formatSeconds, toRoundedSeconds } from "../utils/time";
import { readJson, writeJson } from "../storage/localStorage";
import { formatI18n, useI18n } from "../i18n";

interface RunningState {
  mode: AroundClockMode;
  targets: string[];
  index: number;
  entries: { target: string; seconds: number }[];
  startedAt: number;
  targetStartedAt: number;
  pauseStartedAt: number | null;
  pauseMs: number;
  doubleRequirement: 1 | 2 | null;
  fullSectorOrder: FullSectorOrder | null;
}

type FullSectorOrder = "start_with_bull" | "end_with_bull";

const COMMON_DOUBLES_TARGETS = ["D20", "D10", "D5", "D16", "D8", "D4", "D12", "D18"] as const;
const CENTER_TARGETS = ["25", "Bull"] as const;
const ALL_SINGLES = Array.from({ length: 20 }, (_, i) => `S${i + 1}`);
const ALL_DOUBLES = Array.from({ length: 20 }, (_, i) => `D${i + 1}`);
const ALL_TREBLES = Array.from({ length: 20 }, (_, i) => `T${i + 1}`);
const D16_PATH_TARGETS = ["D16", "D8", "D4", "D2", "D1"] as const;
const CUSTOM_TARGETS_KEY = "around_clock_custom_targets";
const FULL_SECTOR_ORDER_KEY = "around_clock_full_sector_order";
const FULL_SECTOR_CENTER_START = "Bull/25";
const FULL_SECTOR_CENTER_END = "25/Bull";

function sanitizeCustomTargets(values: string[]): string[] {
  const allowed = new Set<string>([...ALL_SINGLES, ...ALL_DOUBLES, ...ALL_TREBLES, ...CENTER_TARGETS]);
  const next: string[] = [];
  for (const value of values) {
    if (allowed.has(value) && !next.includes(value)) {
      next.push(value);
    }
  }
  return next;
}

function createTargets(
  mode: AroundClockMode,
  doubleRequirement: 1 | 2,
  customTargets: string[],
  fullSectorOrder: FullSectorOrder
): string[] {
  if (mode === "singles") {
    return [...Array.from({ length: 20 }, (_, i) => `S${i + 1}`), "Bull"];
  }
  if (mode === "doubles") {
    return [...Array.from({ length: 20 }, (_, i) => `D${i + 1}`), "DBull"];
  }
  if (mode === "trebles") {
    return Array.from({ length: 20 }, (_, i) => `T${i + 1}`);
  }
  if (mode === "common_doubles") {
    return [...COMMON_DOUBLES_TARGETS];
  }
  if (mode === "custom") {
    return [...customTargets];
  }
  const sectorTargets = Array.from({ length: 20 }, (_, i) => {
    const n = i + 1;
    return doubleRequirement === 2 ? `S${n} + T${n} + D${n} + D${n}` : `S${n} + T${n} + D${n}`;
  });
  if (fullSectorOrder === "end_with_bull") {
    return [...sectorTargets, FULL_SECTOR_CENTER_END];
  }
  return [FULL_SECTOR_CENTER_START, ...sectorTargets];
}

export function AroundTheClockScreen({
  onBack,
  onSaveSession,
  previousSessions,
  settings
}: {
  onBack: () => void;
  onSaveSession: (session: AroundClockSession) => void;
  previousSessions: AroundClockSession[];
  settings: UserSettings;
}) {
  const { t } = useI18n();
  const [mode, setMode] = useState<AroundClockMode>("singles");
  const [doubleRequirement, setDoubleRequirement] = useState<1 | 2>(1);
  const [fullSectorOrder, setFullSectorOrder] = useState<FullSectorOrder>("start_with_bull");
  const [customTargets, setCustomTargets] = useState<string[]>([]);
  const [running, setRunning] = useState<RunningState | null>(null);
  const [result, setResult] = useState<AroundClockSession | null>(null);
  const [pbDelta, setPbDelta] = useState<number | null>(null);
  const [ticker, setTicker] = useState(Date.now());

  useEffect(() => {
    const saved = readJson<string[]>(CUSTOM_TARGETS_KEY, []);
    setCustomTargets(sanitizeCustomTargets(saved));
    const savedOrder = readJson<FullSectorOrder>(FULL_SECTOR_ORDER_KEY, "start_with_bull");
    setFullSectorOrder(savedOrder === "end_with_bull" ? "end_with_bull" : "start_with_bull");
  }, []);

  useEffect(() => {
    writeJson(CUSTOM_TARGETS_KEY, customTargets);
  }, [customTargets]);

  useEffect(() => {
    writeJson(FULL_SECTOR_ORDER_KEY, fullSectorOrder);
  }, [fullSectorOrder]);

  useEffect(() => {
    if (!running) {
      return;
    }
    const timer = window.setInterval(() => setTicker(Date.now()), 200);
    return () => window.clearInterval(timer);
  }, [running]);

  const activeTotalSeconds = running
    ? toRoundedSeconds((ticker - running.startedAt - running.pauseMs - (running.pauseStartedAt ? ticker - running.pauseStartedAt : 0)))
    : 0;

  const activeTargetSeconds = running
    ? toRoundedSeconds(
        ticker -
          running.targetStartedAt -
          (running.pauseStartedAt ? ticker - running.pauseStartedAt : 0)
      )
    : 0;

  const currentTarget = running ? running.targets[running.index] : "";
  const canStart = mode !== "custom" || customTargets.length > 0;
  const modeLabels: Record<AroundClockMode, string> = {
    singles: t.aroundClock.singles,
    doubles: t.aroundClock.doubles,
    trebles: t.aroundClock.trebles,
    common_doubles: t.aroundClock.commonDoubles,
    custom: t.aroundClock.custom,
    full_sector: t.aroundClock.fullSector
  };

  const start = () => {
    if (!canStart) {
      return;
    }
    const now = Date.now();
    const targets = createTargets(mode, doubleRequirement, customTargets, fullSectorOrder);
    setPbDelta(null);
    setResult(null);
    setRunning({
      mode,
      targets,
      index: 0,
      entries: [],
      startedAt: now,
      targetStartedAt: now,
      pauseStartedAt: null,
      pauseMs: 0,
      doubleRequirement: mode === "full_sector" ? doubleRequirement : null,
      fullSectorOrder: mode === "full_sector" ? fullSectorOrder : null
    });
  };

  const done = () => {
    if (!running) {
      return;
    }
    const now = Date.now();
    const seconds = toRoundedSeconds(now - running.targetStartedAt);
    const nextEntries = [...running.entries, { target: currentTarget, seconds }];
    triggerHaptic(settings.vibrationFeedback);
    const nextIndex = running.index + 1;
    if (nextIndex >= running.targets.length) {
      const totalActive = toRoundedSeconds(now - running.startedAt - running.pauseMs);
      const estimatedDarts = estimateDartsFromActiveTime(
        totalActive,
        settings.throwPace.secondsPerThree
      );
      const session: AroundClockSession = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        mode: running.mode,
        doubleRequirement: running.doubleRequirement,
        entries: nextEntries,
        totalActiveSeconds: totalActive,
        pauseSeconds: toRoundedSeconds(running.pauseMs),
        estimatedDarts,
        throwPaceSecondsPerThree: settings.throwPace.secondsPerThree
      };
      const comparable = previousSessions
        .filter(
          (item) =>
            item.mode === session.mode && (item.doubleRequirement ?? null) === (session.doubleRequirement ?? null)
        )
        .map((item) => item.totalActiveSeconds);
      if (comparable.length > 0) {
        setPbDelta(totalActive - Math.min(...comparable));
      }
      onSaveSession(session);
      setResult(session);
      setRunning(null);
      return;
    }

    setRunning({
      ...running,
      entries: nextEntries,
      index: nextIndex,
      targetStartedAt: now
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
      targetStartedAt: running.targetStartedAt + pausedFor
    });
  };

  const undo = () => {
    if (!running || running.entries.length === 0) {
      return;
    }
    const nextEntries = running.entries.slice(0, -1);
    const nextIndex = Math.max(0, running.index - 1);
    setRunning({
      ...running,
      entries: nextEntries,
      index: nextIndex,
      targetStartedAt: Date.now()
    });
  };

  const estimated = result?.estimatedDarts ?? null;
  const resultFastest =
    result?.entries.reduce<{ target: string; seconds: number } | null>((best, entry) => {
      if (!best || entry.seconds < best.seconds) {
        return { target: entry.target, seconds: entry.seconds };
      }
      return best;
    }, null) ?? null;
  const resultSlowest =
    result?.entries.reduce<{ target: string; seconds: number } | null>((worst, entry) => {
      if (!worst || entry.seconds > worst.seconds) {
        return { target: entry.target, seconds: entry.seconds };
      }
      return worst;
    }, null) ?? null;
  const resultAverage =
    result && result.entries.length > 0
      ? result.entries.reduce((sum, entry) => sum + entry.seconds, 0) / result.entries.length
      : null;

  return (
    <div className="screen screen-around">
      <ScreenTitle title={t.aroundClock.title} subtitle={t.aroundClock.subtitle} onBack={onBack} />

      {!running && !result ? (
        <Card>
          <h3>{t.aroundClock.setup}</h3>
          <Segmented
            value={mode}
            options={[
              { label: t.aroundClock.singles, value: "singles" },
              { label: t.aroundClock.doubles, value: "doubles" },
              { label: t.aroundClock.trebles, value: "trebles" },
              { label: t.aroundClock.commonDoubles, value: "common_doubles" },
              { label: t.aroundClock.custom, value: "custom" },
              { label: t.aroundClock.fullSector, value: "full_sector" }
            ]}
            onChange={setMode}
          />
          {mode === "custom" ? (
            <div className="top-gap">
              <p className="muted">{t.aroundClock.customTargetsHelp}</p>
              <div className="custom-target-actions">
                <button type="button" className="finish-chip" onClick={() => setCustomTargets(ALL_SINGLES)}>
                  {t.aroundClock.selectAllSingles}
                </button>
                <button type="button" className="finish-chip" onClick={() => setCustomTargets(ALL_DOUBLES)}>
                  {t.aroundClock.selectAllDoubles}
                </button>
                <button type="button" className="finish-chip" onClick={() => setCustomTargets(ALL_TREBLES)}>
                  {t.aroundClock.selectAllTrebles}
                </button>
                <button type="button" className="finish-chip" onClick={() => setCustomTargets([...CENTER_TARGETS])}>
                  {t.aroundClock.selectCenter}
                </button>
                <button type="button" className="finish-chip" onClick={() => setCustomTargets([...COMMON_DOUBLES_TARGETS])}>
                  {t.aroundClock.commonDoublesQuick}
                </button>
                <button type="button" className="finish-chip" onClick={() => setCustomTargets([...D16_PATH_TARGETS])}>
                  {t.aroundClock.d16Path}
                </button>
                <button type="button" className="finish-chip" onClick={() => setCustomTargets([])}>
                  {t.aroundClock.clearAll}
                </button>
              </div>

              <p className="muted top-gap">{t.aroundClock.singles}</p>
              <div className="custom-target-grid">
                {ALL_SINGLES.map((target) => (
                  <button
                    key={target}
                    type="button"
                    className={`finish-chip${customTargets.includes(target) ? " finish-chip-active" : ""}`}
                    onClick={() =>
                      setCustomTargets((prev) =>
                        prev.includes(target) ? prev.filter((value) => value !== target) : [...prev, target]
                      )
                    }
                  >
                    {target}
                  </button>
                ))}
              </div>
              <p className="muted top-gap">{t.aroundClock.doubles}</p>
              <div className="custom-target-grid">
                {ALL_DOUBLES.map((target) => (
                  <button
                    key={target}
                    type="button"
                    className={`finish-chip${customTargets.includes(target) ? " finish-chip-active" : ""}`}
                    onClick={() =>
                      setCustomTargets((prev) =>
                        prev.includes(target) ? prev.filter((value) => value !== target) : [...prev, target]
                      )
                    }
                  >
                    {target}
                  </button>
                ))}
              </div>
              <p className="muted top-gap">{t.aroundClock.trebles}</p>
              <div className="custom-target-grid">
                {ALL_TREBLES.map((target) => (
                  <button
                    key={target}
                    type="button"
                    className={`finish-chip${customTargets.includes(target) ? " finish-chip-active" : ""}`}
                    onClick={() =>
                      setCustomTargets((prev) =>
                        prev.includes(target) ? prev.filter((value) => value !== target) : [...prev, target]
                      )
                    }
                  >
                    {target}
                  </button>
                ))}
              </div>
              <p className="muted top-gap">{t.aroundClock.center}</p>
              <div className="custom-target-grid">
                {CENTER_TARGETS.map((target) => (
                  <button
                    key={target}
                    type="button"
                    className={`finish-chip${customTargets.includes(target) ? " finish-chip-active" : ""}`}
                    onClick={() =>
                      setCustomTargets((prev) =>
                        prev.includes(target) ? prev.filter((value) => value !== target) : [...prev, target]
                      )
                    }
                  >
                    {target}
                  </button>
                ))}
              </div>
              {customTargets.length === 0 ? (
                <p className="warn-text top-gap">{t.aroundClock.selectAtLeastOne}</p>
              ) : (
                <p className="muted top-gap">{formatI18n(t.aroundClock.selectedCount, { count: String(customTargets.length) })}</p>
              )}
            </div>
          ) : null}
          {mode === "full_sector" ? (
            <div className="top-gap">
              <label>{t.aroundClock.fullSectorOrder}</label>
              <Segmented
                value={fullSectorOrder}
                options={[
                  { label: t.aroundClock.startWithBull, value: "start_with_bull" },
                  { label: t.aroundClock.endWithBull, value: "end_with_bull" }
                ]}
                onChange={(value) => setFullSectorOrder(value as FullSectorOrder)}
              />
              <p className="muted top-gap">
                {fullSectorOrder === "start_with_bull"
                  ? t.aroundClock.fullSectorStartSummary
                  : t.aroundClock.fullSectorEndSummary}
              </p>
            </div>
          ) : null}
          {mode === "full_sector" ? (
            <div className="top-gap">
              <label>{t.aroundClock.doubleRequirement}</label>
              <Segmented
                value={doubleRequirement}
                options={[
                  { label: t.aroundClock.oneDoubleHit, value: 1 },
                  { label: t.aroundClock.twoDoubleHits, value: 2 }
                ]}
                onChange={setDoubleRequirement}
              />
            </div>
          ) : null}
          <div className="top-gap">
            <Button full onClick={start} disabled={!canStart}>
              {t.aroundClock.startMode}
            </Button>
          </div>
        </Card>
      ) : null}

      {running ? (
        <Card className="practice-card">
          <div className="practice-header">
            <Pill tone="neutral">{modeLabels[running.mode]}</Pill>
            <Pill tone="neutral">
              {running.index + 1}/{running.targets.length}
            </Pill>
          </div>
          <p className="big-number">{currentTarget}</p>
          {running.mode === "full_sector" ? (
            <p className="muted">
              {running.fullSectorOrder === "end_with_bull"
                ? t.aroundClock.fullSectorEndSummary
                : t.aroundClock.fullSectorStartSummary}
            </p>
          ) : null}
          <div className="metric-grid">
            <div>
              <p className="muted">{t.aroundClock.totalTime}</p>
              <strong>{formatClock(activeTotalSeconds)}</strong>
            </div>
            <div>
              <p className="muted">{t.aroundClock.currentTarget}</p>
              <strong>{formatSeconds(activeTargetSeconds)}</strong>
            </div>
          </div>
          <div className="action-grid action-grid-vertical">
            <Button variant="success" onClick={done}>
              {running.mode === "full_sector" ? t.aroundClock.sectorDone.toUpperCase() : t.aroundClock.targetDone.toUpperCase()}
            </Button>
            <Button variant="secondary" onClick={togglePause}>
              {running.pauseStartedAt ? t.common.resume.toUpperCase() : t.common.pause.toUpperCase()}
            </Button>
            <Button variant="secondary" onClick={undo}>
              {t.common.undo.toUpperCase()}
            </Button>
          </div>
        </Card>
      ) : null}

      {result ? (
        <Card>
          <h3>{t.aroundClock.result}</h3>
          <p className="big-number">{formatClock(result.totalActiveSeconds)}</p>
          <p className="muted">{t.aroundClock.activeTime}: {formatClock(result.totalActiveSeconds)}</p>
          <p className="muted">{t.aroundClock.pauseTime}: {formatClock(result.pauseSeconds)}</p>
          {resultFastest ? (
            <p className="muted">
              {t.aroundClock.fastest}: {resultFastest.target} ({formatSeconds(resultFastest.seconds)})
            </p>
          ) : null}
          {resultSlowest ? (
            <p className="muted">
              {t.aroundClock.slowest}: {resultSlowest.target} ({formatSeconds(resultSlowest.seconds)})
            </p>
          ) : null}
          {resultAverage !== null ? (
            <p className="muted">{t.aroundClock.averageTargetTime}: {formatSeconds(resultAverage)}</p>
          ) : null}
          {estimated !== null ? (
            <p className="muted">
              {t.aroundClock.estimatedDarts}: ~{estimated}
              <br />
              {formatI18n(t.aroundClock.basedOnPace, {
                pace: result.throwPaceSecondsPerThree?.toFixed(2) ?? "-"
              })}
            </p>
          ) : null}
          {pbDelta !== null ? (
            <p className={pbDelta <= 0 ? "good-text" : "warn-text"}>
              {pbDelta <= 0
                ? t.aroundClock.newPersonalBest
                : formatI18n(t.aroundClock.pbDiff, { time: formatPracticeDuration(pbDelta) })}
            </p>
          ) : null}
          <div className="breakdown-list">
            {result.entries.map((entry, index) => (
              <div key={`${entry.target}-${index}`} className="breakdown-item">
                <span>{entry.target}</span>
                <strong>{formatSeconds(entry.seconds)}</strong>
              </div>
            ))}
          </div>
          <div className="top-gap">
            <Button full onClick={() => setResult(null)}>
              {t.aroundClock.newSession}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
