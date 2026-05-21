import { useEffect, useState } from "react";
import { AroundClockSession, AroundClockMode, UserSettings } from "../types/models";
import { Button, Card, Pill, ScreenTitle, Segmented } from "../components/ui";
import { estimateDartsFromActiveTime } from "../utils/pace";
import { triggerHaptic } from "../utils/haptics";
import { formatClock, formatPracticeDuration, formatSeconds, toRoundedSeconds } from "../utils/time";
import { readJson, writeJson } from "../storage/localStorage";

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
}

const COMMON_DOUBLES_TARGETS = ["D20", "D10", "D5", "D16", "D8", "D4", "D12", "D18"] as const;
const CENTER_TARGETS = ["25", "Bull"] as const;
const ALL_SINGLES = Array.from({ length: 20 }, (_, i) => `S${i + 1}`);
const ALL_DOUBLES = Array.from({ length: 20 }, (_, i) => `D${i + 1}`);
const ALL_TREBLES = Array.from({ length: 20 }, (_, i) => `T${i + 1}`);
const D16_PATH_TARGETS = ["D16", "D8", "D4", "D2", "D1"] as const;
const CUSTOM_TARGETS_KEY = "around_clock_custom_targets";
const TARGET_PICKER_ORDER = [...ALL_SINGLES, ...ALL_DOUBLES, ...ALL_TREBLES, ...CENTER_TARGETS];

function summarizeTargetsCompact(prefix: string, targets: string[], limit = 4): string {
  if (targets.length === 0) {
    return `${prefix}: None selected`;
  }
  const shown = targets.slice(0, limit).join(", ");
  if (targets.length <= limit) {
    return `${prefix}: ${shown}`;
  }
  return `${prefix}: ${shown} + ${targets.length - limit} more`;
}

function sanitizeCustomTargets(values: string[]): string[] {
  const allowed = new Set<string>(TARGET_PICKER_ORDER);
  const order = new Map<string, number>(TARGET_PICKER_ORDER.map((target, index) => [target, index]));
  const next: string[] = [];
  for (const value of values) {
    if (allowed.has(value) && !next.includes(value)) {
      next.push(value);
    }
  }
  return next.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
}

function createTargets(mode: AroundClockMode, doubleRequirement: 1 | 2, customTargets: string[]): string[] {
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
  return [
    "Bull",
    "25",
    ...Array.from({ length: 20 }, (_, i) => {
      const n = i + 1;
      return doubleRequirement === 2 ? `S${n} + T${n} + D${n} + D${n}` : `S${n} + T${n} + D${n}`;
    })
  ];
}

function modeLabel(mode: AroundClockMode): string {
  if (mode === "singles") {
    return "Singles";
  }
  if (mode === "doubles") {
    return "Doubles";
  }
  if (mode === "trebles") {
    return "Trebles";
  }
  if (mode === "common_doubles") {
    return "Common Doubles";
  }
  if (mode === "custom") {
    return "Custom";
  }
  return "Full Sector";
}

function setupModeSummary(mode: AroundClockMode, customTargets: string[]): string {
  if (mode === "singles") {
    return "Singles: S1-S20";
  }
  if (mode === "doubles") {
    return "Doubles: D1-D20";
  }
  if (mode === "trebles") {
    return "Trebles: T1-T20";
  }
  if (mode === "full_sector") {
    return "Full Sector: Bull, 25, then S/T/D for sectors 1-20";
  }
  if (mode === "common_doubles") {
    return `Common Doubles: ${COMMON_DOUBLES_TARGETS.join(", ")}`;
  }
  return summarizeTargetsCompact("Custom", customTargets);
}

function activeModeSummary(mode: AroundClockMode, targets: string[]): string {
  if (mode === "common_doubles") {
    return COMMON_DOUBLES_TARGETS.join(" -> ");
  }
  if (mode === "custom") {
    return summarizeTargetsCompact(`Custom: ${targets.length} targets`, targets);
  }
  return summarizeTargetsCompact(modeLabel(mode), targets);
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
  const [mode, setMode] = useState<AroundClockMode>("singles");
  const [doubleRequirement, setDoubleRequirement] = useState<1 | 2>(1);
  const [customTargets, setCustomTargets] = useState<string[]>([]);
  const [running, setRunning] = useState<RunningState | null>(null);
  const [result, setResult] = useState<AroundClockSession | null>(null);
  const [pbDelta, setPbDelta] = useState<number | null>(null);
  const [ticker, setTicker] = useState(Date.now());

  useEffect(() => {
    const saved = readJson<string[]>(CUSTOM_TARGETS_KEY, []);
    setCustomTargets(sanitizeCustomTargets(saved));
  }, []);

  useEffect(() => {
    writeJson(CUSTOM_TARGETS_KEY, customTargets);
  }, [customTargets]);

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

  const start = () => {
    if (!canStart) {
      return;
    }
    const now = Date.now();
    const targets = createTargets(mode, doubleRequirement, customTargets);
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
      doubleRequirement: mode === "full_sector" ? doubleRequirement : null
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
    <div className="screen">
      <ScreenTitle title="Around the Clock" subtitle="One tap only when target/sector is complete." onBack={onBack} />

      {!running && !result ? (
        <Card>
          <h3>Setup</h3>
          <Segmented
            value={mode}
            options={[
              { label: "Singles", value: "singles" },
              { label: "Doubles", value: "doubles" },
              { label: "Trebles", value: "trebles" },
              { label: "Common Doubles", value: "common_doubles" },
              { label: "Custom", value: "custom" },
              { label: "Full Sector", value: "full_sector" }
            ]}
            onChange={setMode}
          />
          <p className="muted top-gap">{setupModeSummary(mode, customTargets)}</p>
          {mode === "custom" ? (
            <div className="top-gap">
              <p className="muted">Pick custom targets (order is preserved).</p>
              <div className="custom-target-actions">
                <button type="button" className="finish-chip" onClick={() => setCustomTargets(ALL_SINGLES)}>
                  Select all singles
                </button>
                <button type="button" className="finish-chip" onClick={() => setCustomTargets(ALL_DOUBLES)}>
                  Select all doubles
                </button>
                <button type="button" className="finish-chip" onClick={() => setCustomTargets(ALL_TREBLES)}>
                  Select all trebles
                </button>
                <button type="button" className="finish-chip" onClick={() => setCustomTargets([...CENTER_TARGETS])}>
                  Select center
                </button>
                <button type="button" className="finish-chip" onClick={() => setCustomTargets([...COMMON_DOUBLES_TARGETS])}>
                  Common doubles
                </button>
                <button type="button" className="finish-chip" onClick={() => setCustomTargets([...D16_PATH_TARGETS])}>
                  D16 path
                </button>
                <button type="button" className="finish-chip" onClick={() => setCustomTargets([])}>
                  Clear all
                </button>
              </div>

              <p className="muted top-gap">Singles</p>
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
              <p className="muted top-gap">Doubles</p>
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
              <p className="muted top-gap">Trebles</p>
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
              <p className="muted top-gap">Center</p>
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
                <p className="warn-text top-gap">Select at least one target.</p>
              ) : (
                <p className="muted top-gap">Selected: {customTargets.length}</p>
              )}
            </div>
          ) : null}
          {mode === "full_sector" ? (
            <div className="top-gap">
              <label>Double requirement for each numbered sector</label>
              <Segmented
                value={doubleRequirement}
                options={[
                  { label: "1 double hit", value: 1 },
                  { label: "2 double hits", value: 2 }
                ]}
                onChange={setDoubleRequirement}
              />
            </div>
          ) : null}
          <div className="top-gap">
            <Button full onClick={start} disabled={!canStart}>
              Start mode
            </Button>
          </div>
        </Card>
      ) : null}

      {running ? (
        <Card className="practice-card">
          <div className="practice-header">
            <Pill tone="neutral">{modeLabel(running.mode)}</Pill>
            <Pill tone="neutral">
              {running.index + 1}/{running.targets.length}
            </Pill>
          </div>
          <p className="big-number">{currentTarget}</p>
          <p className="muted practice-summary">{activeModeSummary(running.mode, running.targets)}</p>
          <div className="metric-grid">
            <div>
              <p className="muted">Total time</p>
              <strong>{formatClock(activeTotalSeconds)}</strong>
            </div>
            <div>
              <p className="muted">Current target</p>
              <strong>{formatSeconds(activeTargetSeconds)}</strong>
            </div>
          </div>
          <div className="action-grid">
            <Button variant="success" onClick={done}>
              {running.mode === "full_sector" ? "SECTOR DONE" : "TARGET DONE"}
            </Button>
            <Button variant="secondary" onClick={togglePause}>
              {running.pauseStartedAt ? "RESUME" : "PAUSE"}
            </Button>
            <Button variant="secondary" onClick={undo}>
              UNDO
            </Button>
          </div>
        </Card>
      ) : null}

      {result ? (
        <Card>
          <h3>Result</h3>
          <p className="big-number">{formatClock(result.totalActiveSeconds)}</p>
          <p className="muted">Active time: {formatClock(result.totalActiveSeconds)}</p>
          <p className="muted">Pause time: {formatClock(result.pauseSeconds)}</p>
          {resultFastest ? (
            <p className="muted">
              Fastest: {resultFastest.target} ({formatSeconds(resultFastest.seconds)})
            </p>
          ) : null}
          {resultSlowest ? (
            <p className="muted">
              Slowest: {resultSlowest.target} ({formatSeconds(resultSlowest.seconds)})
            </p>
          ) : null}
          {resultAverage !== null ? (
            <p className="muted">Average target/sector time: {formatSeconds(resultAverage)}</p>
          ) : null}
          {estimated !== null ? (
            <p className="muted">
              Estimated darts: ~{estimated}
              <br />
              Based on {result.throwPaceSecondsPerThree?.toFixed(2)} sec / 3 darts
            </p>
          ) : null}
          {pbDelta !== null ? (
            <p className={pbDelta <= 0 ? "good-text" : "warn-text"}>
              {pbDelta <= 0 ? "New personal best!" : `PB diff: +${formatPracticeDuration(pbDelta)}`}
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
              New session
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
