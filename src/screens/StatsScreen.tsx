import React from "react";
import { AroundClockSession, CheckoutAttempt, CheckoutSpeedrunSession, StatsRange } from "../types/models";
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
  const { t } = useI18n();
  const [range, setRange] = React.useState<StatsRange>("7d");
  const [showAllTargetsOpen, setShowAllTargetsOpen] = React.useState(false);
  const [openTargetModes, setOpenTargetModes] = React.useState<Record<string, boolean>>({});

  const checkout = getCheckoutStats(checkoutAttempts, range);
  const speedrun = getSpeedrunStats(speedruns, range);
  const around = getAroundClockStats(aroundSessions, range);
  const bestLatestAvg = (best: string, latest: string, avg: string) =>
    formatI18n(t.stats.bestLatestAvg, { best, latest, avg });

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
        {checkout.attemptsCount === 0 ? <p className="muted">{t.stats.noAttempts}</p> : null}
        {checkout.attemptsCount > 0 ? (
          <>
            <details className="stats-subsection">
              <summary>{t.stats.overall}</summary>
              <CompactRow left={t.stats.attempts} right={checkout.attemptsCount} />
              <CompactRow left={t.stats.successRate} right={`${checkout.successRate.toFixed(1)}%`} />
              <CompactRow left={t.stats.wrongRate} right={`${checkout.wrongRate.toFixed(1)}%`} />
              <CompactRow left={t.stats.bustRate} right={`${checkout.bustRate.toFixed(1)}%`} />
              <CompactRow
                left={t.stats.avgAttemptTime}
                right={checkout.averageAttemptTime !== null ? formatSeconds(checkout.averageAttemptTime) : t.common.noDataYet}
              />
              <CompactRow
                left={t.stats.bestAttemptTime}
                right={checkout.bestAttemptTime !== null ? formatSeconds(checkout.bestAttemptTime) : t.common.noDataYet}
              />
            </details>
            <details className="stats-subsection">
              <summary>{t.stats.byRange}</summary>
              {checkout.byRange.map((row) => (
                <CompactRow
                  key={row.rangeLabel}
                  left={row.rangeLabel}
                  middle={`${row.attempts} ${t.stats.attemptsShort} / ${row.successRate.toFixed(0)}%`}
                  right={row.averageTime !== null ? formatSeconds(row.averageTime) : "-"}
                />
              ))}
            </details>
            <details className="stats-subsection">
              <summary>{t.stats.bestFinishes}</summary>
              {checkout.bestFinishes.length === 0 ? <p className="muted">{t.common.noDataYet}</p> : null}
              {checkout.bestFinishes.map((row) => (
                <CompactRow
                  key={`best-${row.finish}`}
                  left={row.finish}
                  middle={`${row.attempts} ${t.stats.attemptsShort}`}
                  right={`${row.successRate.toFixed(0)}% / ${row.averageTime !== null ? formatSeconds(row.averageTime) : "-"}`}
                />
              ))}
            </details>
            <details className="stats-subsection">
              <summary>{t.stats.problemFinishes}</summary>
              {checkout.problemFinishes.length === 0 ? <p className="muted">{t.common.noDataYet}</p> : null}
              {checkout.problemFinishes.map((row) => (
                <CompactRow
                  key={`problem-${row.finish}`}
                  left={row.finish}
                  middle={`${row.attempts} ${t.stats.attemptsShort}`}
                  right={`${row.successRate.toFixed(0)}% / ${row.averageTime !== null ? formatSeconds(row.averageTime) : "-"}`}
                />
              ))}
            </details>
          </>
        ) : null}
      </Card>

      <Card>
        <h3>{t.stats.checkoutTimedRun}</h3>
        {speedrun.sessions === 0 ? <p className="muted">{t.stats.noSessions}</p> : null}
        {speedrun.sessions > 0 ? (
          <>
            <details className="stats-subsection">
              <summary>{t.stats.overall}</summary>
              <CompactRow left={t.stats.sessions} right={speedrun.sessions} />
              <CompactRow
                left={t.stats.bestTotalTime}
                right={speedrun.overallBestTime !== null ? formatClock(speedrun.overallBestTime) : t.common.noDataYet}
              />
              <CompactRow
                left={t.stats.latestTotalTime}
                right={speedrun.latestTotalTime !== null ? formatClock(speedrun.latestTotalTime) : t.common.noDataYet}
              />
              <CompactRow
                left={t.stats.avgTotalTime}
                right={speedrun.averageTotalTime !== null ? formatClock(speedrun.averageTotalTime) : t.common.noDataYet}
              />
            </details>
            <details className="stats-subsection">
              <summary>{t.stats.byRange}</summary>
              {speedrun.byRange.map((row) => (
                <CompactRow
                  key={row.rangeLabel}
                  left={row.rangeLabel}
                  middle={`${row.sessions} ${t.stats.sessions.toLowerCase()}`}
                  right={bestLatestAvg(formatClock(row.bestTime), formatClock(row.latestTime), formatClock(row.averageTime))}
                />
              ))}
            </details>
            <details className="stats-subsection">
              <summary>{t.stats.bestRuns}</summary>
              {speedrun.bestRuns.length === 0 ? <p className="muted">{t.stats.noSessions}</p> : null}
              {speedrun.bestRuns.map((run) => (
                <CompactRow
                  key={run.id}
                  left={`${dateLabel(run.timestamp)} ${run.rangeLabel}`}
                  middle={`${run.completed}/${run.total}`}
                  right={`${formatClock(run.totalTime)} / ${run.averageCheckout !== null ? formatSeconds(run.averageCheckout) : "-"}`}
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
              <summary>{t.stats.overall}</summary>
              <CompactRow left={t.stats.sessions} right={around.sessions} />
              <CompactRow
                left={t.stats.bestTotalTime}
                right={around.bestTotalTime !== null ? formatClock(around.bestTotalTime) : t.common.noDataYet}
              />
              <CompactRow
                left={t.stats.latestTotalTime}
                right={around.latestTotalTime !== null ? formatClock(around.latestTotalTime) : t.common.noDataYet}
              />
              <CompactRow
                left={t.stats.avgTotalTime}
                right={around.averageTotalTime !== null ? formatClock(around.averageTotalTime) : t.common.noDataYet}
              />
            </details>
            <details className="stats-subsection">
              <summary>{t.stats.byMode}</summary>
              {around.byMode.map((row) => (
                <CompactRow
                  key={row.mode}
                  left={row.mode}
                  middle={`${row.sessions} ${t.stats.sessions.toLowerCase()}`}
                  right={bestLatestAvg(formatClock(row.best), formatClock(row.latest), formatClock(row.average))}
                />
              ))}
            </details>
            <details className="stats-subsection">
              <summary>{t.stats.byTargetSector}</summary>
              {around.byTargetGrouped.length === 0 ? <p className="muted">{t.common.noDataYet}</p> : null}
              {around.byTargetGrouped.length > 0 ? (
                <details
                  className="stats-subsection top-gap"
                  open={showAllTargetsOpen}
                  onToggle={(event) => {
                    const isOpen = (event.currentTarget as HTMLDetailsElement).open;
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
                        const isOpen = (event.currentTarget as HTMLDetailsElement).open;
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
                          right={bestLatestAvg(formatSeconds(row.best), formatSeconds(row.latest), formatSeconds(row.average))}
                        />
                      ))}
                    </details>
                  ))}
                </details>
              ) : null}
            </details>
          </>
        ) : null}
      </Card>
    </div>
  );
}
