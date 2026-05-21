import { useEffect, useState } from "react";
import { AroundClockSession, AroundClockMode, UserSettings } from "../types/models";
import { Button, Card, Pill, ScreenTitle, Segmented } from "../components/ui";
import { estimateDartsFromActiveTime } from "../utils/pace";
import { triggerHaptic } from "../utils/haptics";
import { formatClock, formatSeconds, toRoundedSeconds } from "../utils/time";

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

function createTargets(mode: AroundClockMode, doubleRequirement: 1 | 2): string[] {
  if (mode === "singles") {
    return [...Array.from({ length: 20 }, (_, i) => `S${i + 1}`), "Bull"];
  }
  if (mode === "doubles") {
    return [...Array.from({ length: 20 }, (_, i) => `D${i + 1}`), "DBull"];
  }
  if (mode === "trebles") {
    return Array.from({ length: 20 }, (_, i) => `T${i + 1}`);
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
  return "Full Sector";
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
  const [running, setRunning] = useState<RunningState | null>(null);
  const [result, setResult] = useState<AroundClockSession | null>(null);
  const [pbDelta, setPbDelta] = useState<number | null>(null);
  const [ticker, setTicker] = useState(Date.now());

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

  const start = () => {
    const now = Date.now();
    const targets = createTargets(mode, doubleRequirement);
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
              { label: "Full Sector", value: "full_sector" }
            ]}
            onChange={setMode}
          />
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
            <Button full onClick={start}>
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
              {pbDelta <= 0 ? "New personal best!" : `PB diff: +${pbDelta.toFixed(1)}s`}
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
