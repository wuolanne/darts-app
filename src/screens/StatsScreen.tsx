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
  const date = new Date(value);
  return date.toLocaleDateString("en-GB");
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
            <details className="stats-subsection" open>
              <summary>{t.stats.overall}</summary>
              <CompactRow left={t.stats.attempts} right={checkout.attemptsCount} />
              <CompactRow left={t.stats.successRate} right={`${checkout.successRate.toFixed(1)}%`} />
              <CompactRow left="Wrong rate" right={`${checkout.wrongRate.toFixed(1)}%`} />
              <CompactRow left="Bust rate" right={`${checkout.bustRate.toFixed(1)}%`} />
              <CompactRow
                left="Avg attempt time"
                right={checkout.averageAttemptTime !== null ? formatSeconds(checkout.averageAttemptTime) : "Not enough data yet"}
              />
              <CompactRow
                left="Best attempt time"
                right={checkout.bestAttemptTime !== null ? formatSeconds(checkout.bestAttemptTime) : "Not enough data yet"}
              />
            </details>

            <details className="stats-subsection" open>
              <summary>{t.stats.byRange}</summary>
              {checkout.byRange.length === 0 ? <p className="muted">{t.common.noDataYet}</p> : null}
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

            {!checkout.hasFirstTargetData ? (
              <details className="stats-subsection">
                <summary>By first target / route</summary>
                <p className="muted">{t.common.noDataYet}</p>
              </details>
            ) : null}
          </>
        ) : null}
      </Card>

      <Card>
        <h3>{t.stats.checkoutTimedRun}</h3>
        {speedrun.sessions === 0 ? <p className="muted">{t.stats.noSessions}</p> : null}
        {speedrun.sessions > 0 ? (
          <>
            <details className="stats-subsection" open>
              <summary>{t.stats.overall}</summary>
              <CompactRow left={t.stats.sessions} right={speedrun.sessions} />
              <CompactRow
                left="Best total time"
                right={speedrun.overallBestTime !== null ? formatClock(speedrun.overallBestTime) : "Not enough data yet"}
              />
              <CompactRow
                left="Latest total time"
                right={speedrun.latestTotalTime !== null ? formatClock(speedrun.latestTotalTime) : "Not enough data yet"}
              />
              <CompactRow
                left="Avg total time"
                right={speedrun.averageTotalTime !== null ? formatClock(speedrun.averageTotalTime) : "Not enough data yet"}
              />
              <CompactRow
                left="Avg checkout time"
                right={speedrun.averageCheckoutTime !== null ? formatSeconds(speedrun.averageCheckoutTime) : "Not enough data yet"}
              />
              <CompactRow left="Completed checkouts" right={speedrun.completedCheckouts} />
            </details>

            <details className="stats-subsection" open>
              <summary>{t.stats.byRange}</summary>
              {speedrun.byRange.map((row) => (
                <CompactRow
                  key={row.rangeLabel}
                  left={row.rangeLabel}
                  middle={`${row.sessions} sessions`}
                  right={`B ${formatClock(row.bestTime)} / A ${formatClock(row.averageTime)} / L ${formatClock(row.latestTime)}`}
                />
              ))}
            </details>

            <details className="stats-subsection">
              <summary>{t.stats.byFinish}</summary>
              {speedrun.byFinish.length === 0 ? <p className="muted">{t.common.noDataYet}</p> : null}
              {speedrun.byFinish.slice(0, 10).map((row) => (
                <CompactRow
                  key={`speedrun-finish-${row.finish}`}
                  left={row.finish}
                  middle={`${row.completions}/${row.attempts}`}
                  right={`B ${formatSeconds(row.bestTime)} / A ${formatSeconds(row.averageTime)}`}
                />
              ))}
            </details>

            <details className="stats-subsection">
              <summary>Fastest 5 finishes</summary>
              {speedrun.fastestFinishes.map((row) => (
                <CompactRow
                  key={`fast-${row.finish}`}
                  left={row.finish}
                  middle={`${row.completions}/${row.attempts}`}
                  right={formatSeconds(row.bestTime)}
                />
              ))}
            </details>

            <details className="stats-subsection">
              <summary>Slowest 5 finishes</summary>
              {speedrun.slowestFinishes.map((row) => (
                <CompactRow
                  key={`slow-${row.finish}`}
                  left={row.finish}
                  middle={`${row.completions}/${row.attempts}`}
                  right={formatSeconds(row.averageTime)}
                />
              ))}
            </details>

            <details className="stats-subsection">
              <summary>Most practiced 5 finishes</summary>
              {speedrun.mostPracticedFinishes.map((row) => (
                <CompactRow
                  key={`most-${row.finish}`}
                  left={row.finish}
                  middle={`${row.attempts} attempts`}
                  right={`B ${formatSeconds(row.bestTime)}`}
                />
              ))}
            </details>

            <details className="stats-subsection">
              <summary>Best runs</summary>
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
            <details className="stats-subsection" open>
              <summary>{t.stats.overall}</summary>
              <CompactRow left={t.stats.sessions} right={around.sessions} />
              <CompactRow
                left="Best total time"
                right={around.bestTotalTime !== null ? formatClock(around.bestTotalTime) : "Not enough data yet"}
              />
              <CompactRow
                left="Latest total time"
                right={around.latestTotalTime !== null ? formatClock(around.latestTotalTime) : "Not enough data yet"}
              />
              <CompactRow
                left="Avg total time"
                right={around.averageTotalTime !== null ? formatClock(around.averageTotalTime) : "Not enough data yet"}
              />
              <CompactRow
                left="Estimated darts"
                right={around.latestEstimatedDarts !== null ? `~${around.latestEstimatedDarts}` : "Not enough data yet"}
              />
            </details>

            <details className="stats-subsection" open>
              <summary>{t.stats.byMode}</summary>
              {around.byMode.map((row) => (
                <CompactRow
                  key={row.mode}
                  left={row.mode}
                  middle={`${row.sessions} sessions`}
                  right={`B ${formatClock(row.best)} / L ${formatClock(row.latest)} / A ${formatClock(row.average)}`}
                />
              ))}
            </details>

            <details className="stats-subsection">
              <summary>{t.stats.byTargetSector}</summary>
              {around.byTarget.length === 0 ? <p className="muted">{t.common.noDataYet}</p> : null}
              {around.byTarget.slice(0, 18).map((row) => (
                <CompactRow
                  key={`target-${row.key}`}
                  left={row.key}
                  middle={`B ${formatSeconds(row.best)} / L ${formatSeconds(row.latest)}`}
                  right={`A ${formatSeconds(row.average)}`}
                />
              ))}
            </details>

            <details className="stats-subsection" open>
              <summary>{t.stats.fastestSlowest}</summary>
              <CompactRow
                left="Fastest target/sector"
                middle={around.fastest?.key ?? "-"}
                right={around.fastest ? formatSeconds(around.fastest.best) : "-"}
              />
              <CompactRow
                left="Slowest target/sector"
                middle={around.slowest?.key ?? "-"}
                right={around.slowest ? formatSeconds(around.slowest.average) : "-"}
              />
            </details>
          </>
        ) : null}
      </Card>
    </div>
  );
}
