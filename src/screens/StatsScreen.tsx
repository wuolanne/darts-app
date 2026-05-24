import React from "react";
import { AroundClockSession, CheckoutAttempt, CheckoutSpeedrunSession, StatsRange, UserSettings } from "../types/models";
import { Card, ScreenTitle, Segmented } from "../components/ui";
import { getAroundClockStats, getCheckoutStats, getSpeedrunStats } from "../utils/stats";
import { formatClock, formatSeconds } from "../utils/time";
import { formatI18n, useI18n } from "../i18n";

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

type AroundSectionKey = "byTarget" | "history";

const closedAroundSections: Record<AroundSectionKey, boolean> = {
  byTarget: false,
  history: false
};

function formatAroundMode(session: AroundClockSession, t: ReturnType<typeof useI18n>["t"]): string {
  if (session.mode === "singles") return t.aroundClock.singles;
  if (session.mode === "doubles") return t.aroundClock.doubles;
  if (session.mode === "trebles") return t.aroundClock.trebles;
  if (session.mode === "common_doubles") return t.aroundClock.commonDoubles;
  if (session.mode === "custom") return t.aroundClock.custom;
  if (session.mode === "full_sector") {
    const requirement = session.doubleRequirement ? ` (${session.doubleRequirement}D)` : "";
    return `${t.aroundClock.fullSector}${requirement}`;
  }
  return session.mode;
}

function formatAroundEntryLabel(session: AroundClockSession, target: string, t: ReturnType<typeof useI18n>["t"]): string {
  if (session.mode !== "full_sector") return target;
  const normalized = target.trim().toLowerCase();
  if (normalized.includes("bull") || normalized.includes("25")) return "Bull/25";
  const sector = target.match(/\d+/)?.[0];
  return sector ? `${t.stats.sector} ${sector}` : target;
}

export function StatsScreen({
  onBack,
  checkoutAttempts,
  speedruns,
  aroundSessions,
  settings
}: {
  onBack: () => void;
  checkoutAttempts: CheckoutAttempt[];
  speedruns: CheckoutSpeedrunSession[];
  aroundSessions: AroundClockSession[];
  settings: UserSettings;
}) {
  const { t } = useI18n();
  const [range, setRange] = React.useState<StatsRange>("7d");
  const [aroundDetailsOpen, setAroundDetailsOpen] = React.useState(false);
  const [openAroundSections, setOpenAroundSections] =
    React.useState<Record<AroundSectionKey, boolean>>(closedAroundSections);
  const [showAllTargetsOpen, setShowAllTargetsOpen] = React.useState(false);
  const [openTargetModes, setOpenTargetModes] = React.useState<Record<string, boolean>>({});

  const checkout = getCheckoutStats(checkoutAttempts, range);
  const speedrun = getSpeedrunStats(speedruns, range);
  const around = getAroundClockStats(aroundSessions, range);
  const hasThrowPace = typeof settings.throwPace.secondsPerThree === "number" && settings.throwPace.secondsPerThree > 0;
  const bestLatestAvg = (best: string, latest: string, avg: string) =>
    formatI18n(t.stats.bestLatestAvg, { best, latest, avg });
  const formatDurationOrDash = (seconds: number | null | undefined) =>
    typeof seconds === "number" && seconds > 0 ? formatClock(seconds) : "-";

  const filteredAroundSessions = React.useMemo(() => {
    if (range === "total") return [...aroundSessions];
    const days = range === "7d" ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return aroundSessions.filter((session) => new Date(session.timestamp).getTime() >= cutoff);
  }, [aroundSessions, range]);

  const sortedAroundSessions = React.useMemo(
    () => [...filteredAroundSessions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [filteredAroundSessions]
  );

  const setAroundSection = (section: AroundSectionKey, isOpen: boolean) => {
    setOpenAroundSections((previous) => ({
      ...previous,
      [section]: isOpen
    }));
  };

  React.useEffect(() => {
    setAroundDetailsOpen(false);
    setOpenAroundSections(closedAroundSections);
    setShowAllTargetsOpen(false);
    setOpenTargetModes({});
  }, [range]);

  React.useEffect(() => {
    setOpenTargetModes((previous) => {
      const availableModes = new Set(around.byTargetGrouped.map((group) => group.mode));
      return Object.fromEntries(Object.entries(previous).filter(([mode]) => availableModes.has(mode)));
    });
  }, [around.byTargetGrouped]);

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
        {around.sessions === 0 ? <p className="muted">{t.stats.noSessions}</p> : null}
        {around.sessions > 0 ? (
          <>
            <details className="stats-subsection">
              <summary>{t.stats.byMode}</summary>
              {around.byMode.map((row) => (
                <CompactRow
                  key={row.mode}
                  left={row.mode}
                  middle={`${t.stats.sessions} ${row.sessions}`}
                  right={`${t.stats.bestTime} ${formatClock(row.best)} · ${t.stats.latestTime} ${formatClock(row.latest)} · ${t.stats.estimatedHitRate} ${
                    row.estimatedHitRate === null ? "-" : `${row.estimatedHitRate.toFixed(1)} %`
                  }`}
                />
              ))}
            </details>

            <details className="stats-subsection">
              <summary>{t.stats.hardestSectors}</summary>
              {around.hardestSectors.length === 0 ? <p className="muted">{t.common.noDataYet}</p> : null}
              {around.hardestSectors.map((row) => (
                <CompactRow
                  key={row.key}
                  left={row.key}
                  middle={`${t.stats.estimatedDarts} ${
                    row.estimatedDarts === null ? "-" : Math.round(row.estimatedDarts)
                  }`}
                  right={`${t.stats.estimatedHitRate} ${
                    row.estimatedHitRate === null ? "-" : `${row.estimatedHitRate.toFixed(1)} %`
                  }`}
                />
              ))}
            </details>
            {hasThrowPace ? <p className="muted">{t.stats.estimateBasedOnThrowRhythm}</p> : null}
            {!hasThrowPace ? <p className="muted">{t.stats.throwRhythmCta}</p> : null}

            <details className="stats-subsection">
              <summary>{t.stats.bestPerformances}</summary>
              {around.bestTimeByMode.length === 0 ? <p className="muted">{t.common.noDataYet}</p> : null}
              {around.bestTimeByMode.map((row) => (
                <CompactRow
                  key={row.mode}
                  left={row.mode}
                  middle={`${t.stats.bestTotalTime} ${formatClock(row.bestTotalTime)}`}
                  right={`${t.stats.date} ${dateLabel(row.timestamp)}`}
                />
              ))}
            </details>

            <div className="stats-toolbar">
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  if (aroundDetailsOpen) {
                    setOpenAroundSections(closedAroundSections);
                    setShowAllTargetsOpen(false);
                    setOpenTargetModes({});
                  }
                  setAroundDetailsOpen((prev) => !prev);
                }}
              >
                {aroundDetailsOpen ? t.stats.hideDetailedAroundStats : t.stats.showDetailedAroundStats}
              </button>
            </div>

            {aroundDetailsOpen ? (
              <>
                <details
                  className="stats-subsection"
                  open={openAroundSections.byTarget}
                  onToggle={(event) => setAroundSection("byTarget", event.currentTarget.open)}
                >
                  <summary>{t.stats.byTargetSector}</summary>
                  {around.byTargetGrouped.length === 0 ? <p className="muted">{t.common.noDataYet}</p> : null}
                  {around.byTargetGrouped.length > 0 ? (
                    <details
                      className="stats-subsection top-gap"
                      open={showAllTargetsOpen}
                      onToggle={(event) => {
                        const isOpen = event.currentTarget.open;
                        setShowAllTargetsOpen(isOpen);
                      }}
                    >
                      <summary>{t.stats.showAllTargetsSectors}</summary>
                      {around.byTargetGrouped.map((group) => (
                        <details
                          key={group.mode}
                          className="stats-subsection top-gap"
                          open={openTargetModes[group.mode] === true}
                          onToggle={(event) => {
                            const isOpen = event.currentTarget.open;
                            setOpenTargetModes((prev) => ({
                              ...prev,
                              [group.mode]: isOpen
                            }));
                          }}
                        >
                          <summary>{group.mode}</summary>
                          {group.rows.map((row) => (
                            <CompactRow
                              key={`${group.mode}-${row.key}`}
                              left={row.key}
                              right={bestLatestAvg(
                                formatSeconds(row.best),
                                formatSeconds(row.latest),
                                formatSeconds(row.average)
                              )}
                            />
                          ))}
                        </details>
                      ))}
                    </details>
                  ) : null}
                </details>

                <details
                  className="stats-subsection"
                  open={openAroundSections.history}
                  onToggle={(event) => setAroundSection("history", event.currentTarget.open)}
                >
                  <summary>{t.stats.sessionHistory}</summary>
                  {sortedAroundSessions.length === 0 ? <p className="muted">{t.stats.noSessions}</p> : null}
                  {sortedAroundSessions.map((session) => (
                    <details key={session.id} className="stats-subsection top-gap">
                      <summary>
                        {dateLabel(session.timestamp)}{" · "}
                        {formatAroundMode(session, t)}{" · "}
                        {formatClock(session.totalActiveSeconds)}
                      </summary>
                      <CompactRow left={t.aroundClock.activeTime} right={formatClock(session.totalActiveSeconds)} />
                      <CompactRow left={t.stats.pauses} right={formatClock(session.pauseSeconds)} />
                      <CompactRow left={t.stats.targets} right={session.entries.length} />
                      {session.estimatedDarts !== null ? (
                        <CompactRow left={t.stats.estimated} right={`~${session.estimatedDarts}`} />
                      ) : null}
                      <details className="stats-subsection top-gap">
                        <summary>{t.stats.entries}</summary>
                        {session.entries.map((entry, index) => (
                          <CompactRow
                            key={`${session.id}-${entry.target}-${index}`}
                            left={formatAroundEntryLabel(session, entry.target, t)}
                            right={formatSeconds(entry.seconds)}
                          />
                        ))}
                      </details>
                    </details>
                  ))}
                </details>
              </>
            ) : null}
          </>
        ) : null}
      </Card>
    </div>
  );
}
