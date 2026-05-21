import React from "react";
import { AroundClockSession, CheckoutAttempt, CheckoutSpeedrunSession, StatsRange } from "../types/models";
import { Card, ScreenTitle, Segmented } from "../components/ui";
import { getAroundClockStats, getCheckoutStats, getSpeedrunStats } from "../utils/stats";
import { formatClock, formatSeconds } from "../utils/time";
import { useI18n } from "../i18n";

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

  const checkout = getCheckoutStats(checkoutAttempts, range);
  const speedrun = getSpeedrunStats(speedruns, range);
  const around = getAroundClockStats(aroundSessions, range);

  return (
    <div className="screen">
      <ScreenTitle title={t.stats.title} subtitle={t.stats.subtitle} onBack={onBack} />
      <Card>
        <Segmented
          value={range}
          options={[
            { label: "7 Days", value: "7d" },
            { label: "30 Days", value: "30d" },
            { label: "Total", value: "total" }
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
              <CompactRow left="Wrong rate" right={`${checkout.wrongRate.toFixed(1)}%`} />
              <CompactRow left="Bust rate" right={`${checkout.bustRate.toFixed(1)}%`} />
              <CompactRow
                left="Avg attempt time"
                right={checkout.averageAttemptTime !== null ? formatSeconds(checkout.averageAttemptTime) : t.common.noDataYet}
              />
              <CompactRow
                left="Best attempt time"
                right={checkout.bestAttemptTime !== null ? formatSeconds(checkout.bestAttemptTime) : t.common.noDataYet}
              />
            </details>
            <details className="stats-subsection">
              <summary>{t.stats.byRange}</summary>
              {checkout.byRange.map((row) => (
                <CompactRow
                  key={row.rangeLabel}
                  left={row.rangeLabel}
                  middle={`${row.attempts} att / ${row.successRate.toFixed(0)}%`}
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
                  middle={`${row.attempts} attempts`}
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
                  middle={`${row.attempts} attempts`}
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
                left="Best total time"
                right={speedrun.overallBestTime !== null ? formatClock(speedrun.overallBestTime) : t.common.noDataYet}
              />
              <CompactRow
                left="Latest total time"
                right={speedrun.latestTotalTime !== null ? formatClock(speedrun.latestTotalTime) : t.common.noDataYet}
              />
              <CompactRow
                left="Avg total time"
                right={speedrun.averageTotalTime !== null ? formatClock(speedrun.averageTotalTime) : t.common.noDataYet}
              />
            </details>
            <details className="stats-subsection">
              <summary>{t.stats.byRange}</summary>
              {speedrun.byRange.map((row) => (
                <CompactRow
                  key={row.rangeLabel}
                  left={row.rangeLabel}
                  middle={`${row.sessions} sessions`}
                  right={`Best ${formatClock(row.bestTime)} · Latest ${formatClock(row.latestTime)} · Avg ${formatClock(row.averageTime)}`}
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
                left="Best total time"
                right={around.bestTotalTime !== null ? formatClock(around.bestTotalTime) : t.common.noDataYet}
              />
              <CompactRow
                left="Latest total time"
                right={around.latestTotalTime !== null ? formatClock(around.latestTotalTime) : t.common.noDataYet}
              />
              <CompactRow
                left="Avg total time"
                right={around.averageTotalTime !== null ? formatClock(around.averageTotalTime) : t.common.noDataYet}
              />
            </details>
            <details className="stats-subsection">
              <summary>{t.stats.byMode}</summary>
              {around.byMode.map((row) => (
                <CompactRow
                  key={row.mode}
                  left={row.mode}
                  middle={`${row.sessions} sessions`}
                  right={`Best ${formatClock(row.best)} · Latest ${formatClock(row.latest)} · Avg ${formatClock(row.average)}`}
                />
              ))}
            </details>
            <details className="stats-subsection">
              <summary>{t.stats.byTargetSector}</summary>
              {around.byTargetGrouped.length === 0 ? <p className="muted">{t.common.noDataYet}</p> : null}
              {around.byTargetGrouped.length > 0 ? (
                <>
                  <p className="muted">Fastest 5 targets/sectors</p>
                  {[...around.byTarget].sort((a, b) => a.best - b.best).slice(0, 5).map((row) => (
                    <CompactRow
                      key={`fast-${row.mode}-${row.key}`}
                      left={`${row.mode} · ${row.key}`}
                      middle={`Best ${formatSeconds(row.best)} · Latest ${formatSeconds(row.latest)}`}
                      right={`Avg ${formatSeconds(row.average)}`}
                    />
                  ))}
                  <p className="muted top-gap">Slowest 5 targets/sectors</p>
                  {[...around.byTarget].sort((a, b) => b.average - a.average).slice(0, 5).map((row) => (
                    <CompactRow
                      key={`slow-${row.mode}-${row.key}`}
                      left={`${row.mode} · ${row.key}`}
                      middle={`Best ${formatSeconds(row.best)} · Latest ${formatSeconds(row.latest)}`}
                      right={`Avg ${formatSeconds(row.average)}`}
                    />
                  ))}
                  <details className="stats-subsection top-gap">
                    <summary>Show all targets/sectors</summary>
                    {around.byTargetGrouped.map((group) => (
                      <div key={group.mode} className="top-gap">
                        <p className="muted">{group.mode}</p>
                        {group.rows.map((row) => (
                          <CompactRow
                            key={`${group.mode}-${row.key}`}
                            left={row.key}
                            middle={`Best ${formatSeconds(row.best)} · Latest ${formatSeconds(row.latest)}`}
                            right={`Avg ${formatSeconds(row.average)}`}
                          />
                        ))}
                      </div>
                    ))}
                  </details>
                </>
              ) : null}
            </details>
            <details className="stats-subsection">
              <summary>{t.stats.fastestSlowest}</summary>
              <CompactRow
                left="Fastest target/sector"
                middle={around.fastest ? `${around.fastest.mode} · ${around.fastest.key}` : "-"}
                right={around.fastest ? `Best ${formatSeconds(around.fastest.best)}` : "-"}
              />
              <CompactRow
                left="Slowest target/sector"
                middle={around.slowest ? `${around.slowest.mode} · ${around.slowest.key}` : "-"}
                right={around.slowest ? `Avg ${formatSeconds(around.slowest.average)}` : "-"}
              />
            </details>
          </>
        ) : null}
      </Card>
    </div>
  );
}
