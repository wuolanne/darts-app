import React from "react";
import { AroundClockSession, CheckoutAttempt, CheckoutSpeedrunSession, StatsRange } from "../types/models";
import { Card, ScreenTitle, Segmented } from "../components/ui";
import { getCheckoutStats, getSpeedrunStats } from "../utils/stats";
import { formatClock, formatSeconds } from "../utils/time";
import { useI18n } from "../i18n";

type AroundDetailModeKey =
  | "all"
  | "singles"
  | "doubles"
  | "trebles"
  | "common_doubles"
  | "custom"
  | "full_sector";

type AroundModeSummary = {
  key: string;
  label: string;
  sessions: number;
  best: number;
  latest: number;
  latestTimestamp: string;
};

type AroundEntryRecord = {
  modeKey: Exclude<AroundDetailModeKey, "all">;
  modeLabel: string;
  targetLabel: string;
  sectorLabel: string;
  seconds: number;
  timestamp: string;
};

type AroundSectorSummary = {
  key: string;
  attempts: number;
  averageTime: number;
};

type AroundTargetSummary = {
  key: string;
  attempts: number;
  best: number;
  latest: number;
  average: number;
  latestTimestamp: string;
};

function CompactRow({
  left,
  middle,
  right
}: {
  left: React.ReactNode;
  middle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="stats-row">
      <span>{left}</span>
      <span>{middle ?? ""}</span>
      <strong>{right ?? ""}</strong>
    </div>
  );
}

function dateLabel(value: string): string {
  return new Date(value).toLocaleDateString("en-GB");
}

function getModeKey(session: AroundClockSession): Exclude<AroundDetailModeKey, "all"> {
  return session.mode === "full_sector" ? "full_sector" : session.mode;
}

function getModeLabel(mode: Exclude<AroundDetailModeKey, "all">, t: ReturnType<typeof useI18n>["t"]): string {
  if (mode === "singles") return t.aroundClock.singles;
  if (mode === "doubles") return t.aroundClock.doubles;
  if (mode === "trebles") return t.aroundClock.trebles;
  if (mode === "common_doubles") return t.aroundClock.commonDoubles;
  if (mode === "custom") return t.aroundClock.custom;
  return t.aroundClock.fullSector;
}

function getSessionModeLabel(session: AroundClockSession, t: ReturnType<typeof useI18n>["t"]): string {
  if (session.mode !== "full_sector") return getModeLabel(getModeKey(session), t);
  const requirement = session.doubleRequirement ? ` (${session.doubleRequirement}D)` : "";
  return `${t.aroundClock.fullSector}${requirement}`;
}

function getEntryTargetLabel(session: AroundClockSession, target: string, t: ReturnType<typeof useI18n>["t"]): string {
  if (session.mode !== "full_sector") return target;
  const normalized = target.trim().toLowerCase();
  if (normalized.includes("bull") || normalized.includes("25")) return "Bull/25";
  const sector = target.match(/\d+/)?.[0];
  return sector ? `${t.stats.sector} ${sector}` : target;
}

function getSectorLabel(target: string): string {
  const normalized = target.trim().toLowerCase();
  if (normalized.includes("bull") || normalized.includes("25")) return "Bull/25";
  const sector = target.match(/\d+/)?.[0];
  return sector ? String(Number(sector)) : target;
}

function getBestDefaultMode(
  modeOptions: { value: Exclude<AroundDetailModeKey, "all">; entries: number; latestTimestamp: string }[]
): Exclude<AroundDetailModeKey, "all"> | null {
  if (modeOptions.length === 0) return null;
  const sorted = [...modeOptions].sort((a, b) => {
    if (b.entries !== a.entries) return b.entries - a.entries;
    return new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime();
  });
  return sorted[0].value;
}

export function StatsScreen({
  onBack,
  checkoutAttempts,
  speedruns,
  aroundSessions
}: {
  onBack: () => void;
  checkoutAttempts: CheckoutAttempt[];
  speedruns: CheckoutSpeedrunSession[];
  aroundSessions: AroundClockSession[];
}) {
  const { t, resolvedLanguage } = useI18n();
  const [range, setRange] = React.useState<StatsRange>("7d");
  const [aroundDetailsOpen, setAroundDetailsOpen] = React.useState(false);
  const [hardestMode, setHardestMode] = React.useState<AroundDetailModeKey>("all");
  const [targetMode, setTargetMode] = React.useState<Exclude<AroundDetailModeKey, "all"> | null>(null);

  const checkout = getCheckoutStats(checkoutAttempts, range);
  const speedrun = getSpeedrunStats(speedruns, range);

  const showDetailedTargetStats =
    resolvedLanguage === "fi" ? "Näytä kohdekohtaiset lisätilastot" : "Show detailed target stats";
  const hideDetailedTargetStats =
    resolvedLanguage === "fi" ? "Piilota kohdekohtaiset lisätilastot" : "Hide detailed target stats";

  const formatDurationOrDash = (seconds: number | null | undefined) =>
    typeof seconds === "number" && seconds > 0 ? formatClock(seconds) : "-";

  const filteredAroundSessions = React.useMemo(() => {
    if (range === "total") return [...aroundSessions];
    const days = range === "7d" ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return aroundSessions.filter((session) => new Date(session.timestamp).getTime() >= cutoff);
  }, [aroundSessions, range]);

  const sortedAroundSessions = React.useMemo(
    () =>
      [...filteredAroundSessions]
        .filter((session) => session.totalActiveSeconds > 0)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [filteredAroundSessions]
  );

  const aroundModeSummaries = React.useMemo<AroundModeSummary[]>(() => {
    const map = new Map<string, AroundClockSession[]>();
    for (const session of filteredAroundSessions) {
      if (session.totalActiveSeconds <= 0) continue;
      const key = `${session.mode}:${session.doubleRequirement ?? 0}`;
      const list = map.get(key) ?? [];
      list.push(session);
      map.set(key, list);
    }

    return Array.from(map.entries())
      .map(([key, items]) => {
        const latest = [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        const times = items.map((item) => item.totalActiveSeconds).filter((value) => value > 0);
        return {
          key,
          label: getSessionModeLabel(items[0], t),
          sessions: items.length,
          best: Math.min(...times),
          latest: latest.totalActiveSeconds,
          latestTimestamp: latest.timestamp
        };
      })
      .filter((row) => row.sessions > 0 && row.best > 0 && row.latest > 0)
      .sort((a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime());
  }, [filteredAroundSessions, t]);

  const aroundEntryRecords = React.useMemo<AroundEntryRecord[]>(() => {
    return filteredAroundSessions.flatMap((session) =>
      session.entries
        .filter((entry) => entry.seconds > 0)
        .map((entry) => ({
          modeKey: getModeKey(session),
          modeLabel: getModeLabel(getModeKey(session), t),
          targetLabel: getEntryTargetLabel(session, entry.target, t),
          sectorLabel: getSectorLabel(entry.target),
          seconds: entry.seconds,
          timestamp: session.timestamp
        }))
    );
  }, [filteredAroundSessions, t]);

  const aroundModeOptions = React.useMemo(() => {
    const map = new Map<
      Exclude<AroundDetailModeKey, "all">,
      { value: Exclude<AroundDetailModeKey, "all">; label: string; entries: number; latestTimestamp: string }
    >();

    for (const row of aroundEntryRecords) {
      const current = map.get(row.modeKey);
      if (!current) {
        map.set(row.modeKey, {
          value: row.modeKey,
          label: row.modeLabel,
          entries: 1,
          latestTimestamp: row.timestamp
        });
        continue;
      }
      current.entries += 1;
      if (new Date(row.timestamp).getTime() > new Date(current.latestTimestamp).getTime()) {
        current.latestTimestamp = row.timestamp;
      }
    }

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [aroundEntryRecords]);

  const defaultAroundMode = React.useMemo(() => getBestDefaultMode(aroundModeOptions), [aroundModeOptions]);

  React.useEffect(() => {
    if (defaultAroundMode && hardestMode === "all") {
      setHardestMode(defaultAroundMode);
    }
    if (!targetMode && defaultAroundMode) {
      setTargetMode(defaultAroundMode);
    }
  }, [defaultAroundMode, hardestMode, targetMode]);

  React.useEffect(() => {
    if (hardestMode !== "all" && !aroundModeOptions.some((option) => option.value === hardestMode)) {
      setHardestMode(defaultAroundMode ?? "all");
    }
    if (targetMode && !aroundModeOptions.some((option) => option.value === targetMode)) {
      setTargetMode(defaultAroundMode);
    }
  }, [aroundModeOptions, hardestMode, targetMode, defaultAroundMode]);

  const hardestSectorRows = React.useMemo<AroundSectorSummary[]>(() => {
    const sourceRows =
      hardestMode === "all"
        ? aroundEntryRecords
        : aroundEntryRecords.filter((row) => row.modeKey === hardestMode);

    const map = new Map<string, { attempts: number; totalTime: number }>();

    for (const row of sourceRows) {
      const current = map.get(row.sectorLabel) ?? { attempts: 0, totalTime: 0 };
      current.attempts += 1;
      current.totalTime += row.seconds;
      map.set(row.sectorLabel, current);
    }

    return Array.from(map.entries())
      .map(([key, item]) => ({
        key,
        attempts: item.attempts,
        averageTime: item.attempts > 0 ? item.totalTime / item.attempts : 0
      }))
      .filter((row) => row.attempts > 0 && row.averageTime > 0)
      .sort((a, b) => b.averageTime - a.averageTime || b.attempts - a.attempts || a.key.localeCompare(b.key, undefined, { numeric: true }))
      .slice(0, 5);
  }, [aroundEntryRecords, hardestMode]);

  const targetStatRows = React.useMemo<AroundTargetSummary[]>(() => {
    if (!targetMode) return [];
    const sourceRows = aroundEntryRecords.filter((row) => row.modeKey === targetMode);
    const map = new Map<string, { attempts: number; total: number; best: number; latest: number; latestTimestamp: string }>();

    for (const row of sourceRows) {
      const current = map.get(row.targetLabel);
      if (!current) {
        map.set(row.targetLabel, {
          attempts: 1,
          total: row.seconds,
          best: row.seconds,
          latest: row.seconds,
          latestTimestamp: row.timestamp
        });
        continue;
      }
      current.attempts += 1;
      current.total += row.seconds;
      current.best = Math.min(current.best, row.seconds);
      if (new Date(row.timestamp).getTime() >= new Date(current.latestTimestamp).getTime()) {
        current.latest = row.seconds;
        current.latestTimestamp = row.timestamp;
      }
    }

    return Array.from(map.entries())
      .map(([key, item]) => ({
        key,
        attempts: item.attempts,
        best: item.best,
        latest: item.latest,
        average: item.total / item.attempts,
        latestTimestamp: item.latestTimestamp
      }))
      .filter((row) => row.attempts > 0 && (row.best > 0 || row.latest > 0 || row.average > 0))
      .sort((a, b) => b.average - a.average || b.attempts - a.attempts || a.key.localeCompare(b.key, undefined, { numeric: true }));
  }, [aroundEntryRecords, targetMode]);

  const bestAroundPerformances = React.useMemo(() => {
    const bestByMode = new Map<string, { key: string; label: string; bestTotalTime: number; timestamp: string }>();
    for (const session of filteredAroundSessions) {
      if (session.totalActiveSeconds <= 0) continue;
      const key = `${session.mode}:${session.doubleRequirement ?? 0}`;
      const label = getSessionModeLabel(session, t);
      const current = bestByMode.get(key);
      if (!current || session.totalActiveSeconds < current.bestTotalTime) {
        bestByMode.set(key, {
          key,
          label,
          bestTotalTime: session.totalActiveSeconds,
          timestamp: session.timestamp
        });
      }
    }
    return Array.from(bestByMode.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [filteredAroundSessions, t]);

  const aroundHasDetailedData = targetStatRows.length > 0;

  return (
    <div className="screen screen-stats">
      <ScreenTitle title={t.stats.title} subtitle={t.stats.subtitle} onBack={onBack} />
      <Card>
        <Segmented
          value={range}
          options={[
            { label: t.stats.sevenDays, value: "7d" },
            { label: t.stats.thirtyDays, value: "30d" },
            { label: t.stats.total, value: "total" }
          ]}
          onChange={setRange}
        />
      </Card>

      <Card>
        <h3>{t.stats.quickCheckoutPractice}</h3>
        <details className="stats-subsection">
          <summary>{t.stats.overall}</summary>
          <CompactRow left={t.stats.attempts} right={checkout.attemptsCount} />
          <CompactRow
            left={t.stats.successRate}
            right={checkout.attemptsCount > 0 ? `${checkout.successRate.toFixed(1)} %` : "-"}
          />
        </details>
        <details className="stats-subsection">
          <summary>{t.stats.byRange}</summary>
          {checkout.miniByRange.map((row) => (
            <CompactRow
              key={row.rangeLabel}
              left={row.rangeLabel}
              middle={`${t.stats.attempts} ${row.attempts}`}
              right={`${t.stats.successRate} ${row.successRate === null ? "-" : `${row.successRate.toFixed(1)} %`}`}
            />
          ))}
        </details>
      </Card>

      <Card>
        <h3>{t.stats.checkoutTimedRun}</h3>
        {speedrun.sessions === 0 ? (
          <>
            <p className="muted">{t.stats.noTimedCheckoutStats}</p>
            <p className="muted">{t.stats.noTimedCheckoutStatsHint}</p>
          </>
        ) : null}
        {speedrun.sessions > 0 ? (
          <>
            <details className="stats-subsection">
              <summary>{t.stats.byRange}</summary>
              {speedrun.byRange.map((row) => (
                <CompactRow
                  key={row.rangeLabel}
                  left={row.rangeLabel}
                  middle={`${t.stats.sessions} ${row.sessions}`}
                  right={`${t.stats.bestTime} ${formatDurationOrDash(row.bestTime)} · ${t.stats.latestTime} ${formatDurationOrDash(row.latestTime)} · ${t.stats.averageLabel} ${formatDurationOrDash(row.averageTime)}`}
                />
              ))}
            </details>
            <details className="stats-subsection">
              <summary>{t.stats.bestPerformances}</summary>
              {speedrun.bestPerformanceByRange.length === 0 ? <p className="muted">{t.stats.noSessions}</p> : null}
              {speedrun.bestPerformanceByRange.map((run) => (
                <CompactRow
                  key={`${run.rangeLabel}-${run.timestamp}`}
                  left={run.rangeLabel}
                  middle={`${t.stats.bestTotalTime} ${formatDurationOrDash(run.totalTime)}`}
                  right={`${t.stats.date} ${dateLabel(run.timestamp)}`}
                />
              ))}
            </details>
          </>
        ) : null}
      </Card>

      <Card>
        <h3>{t.stats.aroundTheClock}</h3>
        {aroundModeSummaries.length === 0 ? <p className="muted">{t.stats.noSessions}</p> : null}
        {aroundModeSummaries.length > 0 ? (
          <>
            <details className="stats-subsection">
              <summary>{t.stats.byMode}</summary>
              {aroundModeSummaries.map((row) => (
                <CompactRow
                  key={row.key}
                  left={row.label}
                  middle={`${t.stats.sessions} ${row.sessions}`}
                  right={`${t.stats.bestTime} ${formatClock(row.best)} · ${t.stats.latestTime} ${formatClock(row.latest)}`}
                />
              ))}
            </details>

            <details className="stats-subsection">
              <summary>{t.stats.hardestSectors}</summary>
              {aroundModeOptions.length > 0 ? (
                <Segmented
                  value={hardestMode}
                  options={[
                    ...aroundModeOptions.map((option) => ({ label: option.label, value: option.value })),
                    { label: t.stats.allGameModes, value: "all" as AroundDetailModeKey }
                  ]}
                  onChange={(value) => setHardestMode(value as AroundDetailModeKey)}
                />
              ) : null}
              {hardestSectorRows.length === 0 ? <p className="muted">{t.stats.noSectorLevelData}</p> : null}
              {hardestSectorRows.map((row) => (
                <CompactRow
                  key={row.key}
                  left={row.key}
                  middle={`${t.stats.attempts} ${row.attempts}`}
                  right={`${t.stats.averageTime} ${formatSeconds(row.averageTime)}`}
                />
              ))}
            </details>

            <details className="stats-subsection">
              <summary>{t.stats.bestPerformances}</summary>
              {bestAroundPerformances.length === 0 ? <p className="muted">{t.common.noDataYet}</p> : null}
              {bestAroundPerformances.map((row) => (
                <CompactRow
                  key={row.key}
                  left={row.label}
                  middle={`${t.stats.bestTotalTime} ${formatClock(row.bestTotalTime)}`}
                  right={`${t.stats.date} ${dateLabel(row.timestamp)}`}
                />
              ))}
            </details>

            <details className="stats-subsection">
              <summary>{t.stats.sessionHistory}</summary>
              {sortedAroundSessions.length === 0 ? <p className="muted">{t.stats.noSessions}</p> : null}
              {sortedAroundSessions.map((session) => {
                const sessionEntries = session.entries.filter((entry) => entry.seconds > 0);
                const hasMeaningfulDetail = sessionEntries.length > 0;

                if (!hasMeaningfulDetail) {
                  return (
                    <CompactRow
                      key={session.id}
                      left={dateLabel(session.timestamp)}
                      middle={getSessionModeLabel(session, t)}
                      right={`${t.stats.totalTime} ${formatClock(session.totalActiveSeconds)}`}
                    />
                  );
                }

                return (
                  <details key={session.id} className="stats-subsection top-gap">
                    <summary>
                      {dateLabel(session.timestamp)}{" · "}
                      {getSessionModeLabel(session, t)}{" · "}
                      {t.stats.totalTime} {formatClock(session.totalActiveSeconds)}
                    </summary>
                    <CompactRow left={t.stats.date} right={dateLabel(session.timestamp)} />
                    <CompactRow left={t.stats.gameModes} right={getSessionModeLabel(session, t)} />
                    <CompactRow left={t.stats.totalTime} right={formatClock(session.totalActiveSeconds)} />
                    {sessionEntries.map((entry, index) => (
                      <CompactRow
                        key={`${session.id}-${entry.target}-${index}`}
                        left={getEntryTargetLabel(session, entry.target, t)}
                        right={formatSeconds(entry.seconds)}
                      />
                    ))}
                  </details>
                );
              })}
            </details>

            <div className="stats-toolbar">
              <button
                type="button"
                className="link-btn"
                onClick={() => setAroundDetailsOpen((prev) => !prev)}
              >
                {aroundDetailsOpen ? hideDetailedTargetStats : showDetailedTargetStats}
              </button>
            </div>

            {aroundDetailsOpen ? (
              aroundHasDetailedData ? (
                <div className="stats-subsection">
                  <strong>{t.stats.byTargetSector}</strong>
                  {aroundModeOptions.length > 0 && targetMode ? (
                    <>
                      <Segmented
                        value={targetMode}
                        options={aroundModeOptions.map((option) => ({ label: option.label, value: option.value }))}
                        onChange={(value) => setTargetMode(value as Exclude<AroundDetailModeKey, "all">)}
                      />
                      <p className="muted">
                        {t.stats.selectedGameMode}: {getModeLabel(targetMode, t)}
                      </p>
                    </>
                  ) : null}
                  {targetStatRows.length === 0 ? <p className="muted">{t.stats.noTargetLevelData}</p> : null}
                  {targetStatRows.map((row) => (
                    <CompactRow
                      key={`target-${row.key}`}
                      left={row.key}
                      middle={`${t.stats.bestTime} ${formatSeconds(row.best)}`}
                      right={`${t.stats.latestTime} ${formatSeconds(row.latest)}`}
                    />
                  ))}
                </div>
              ) : (
                <>
                  <p className="muted">{t.stats.noDetailedAroundStats}</p>
                  <p className="muted">{t.stats.noDetailedAroundStatsHint}</p>
                </>
              )
            ) : null}
          </>
        ) : null}
      </Card>
    </div>
  );
}
