import React from "react";
import { AroundClockSession, CheckoutAttempt, CheckoutSpeedrunSession, StatsRange } from "../types/models";
import { Card, ScreenTitle, Segmented } from "../components/ui";
import { getAroundClockStats, getCheckoutStats, getSpeedrunStats } from "../utils/stats";
import { formatClock, formatSeconds } from "../utils/time";

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
  const [range, setRange] = React.useState<StatsRange>("7d");

  const checkout = getCheckoutStats(checkoutAttempts, range);
  const speedrun = getSpeedrunStats(speedruns, range);
  const around = getAroundClockStats(aroundSessions, range);

  return (
    <div className="screen">
      <ScreenTitle title="Stats" subtitle="Simple local insights from your practice." onBack={onBack} />
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
        <h3>Checkout Practice</h3>
        <p>Attempts: {checkout.attemptsCount}</p>
        <p>Success rate: {checkout.successRate.toFixed(1)}%</p>
        <p>Good leave rate: {checkout.goodLeaveRate.toFixed(1)}%</p>
        <p>Bust rate: {checkout.bustRate.toFixed(1)}%</p>
        <p>
          Avg attempt time:{" "}
          {checkout.averageAttemptTime !== null ? formatSeconds(checkout.averageAttemptTime) : "N/A"}
        </p>
      </Card>

      <Card>
        <h3>Checkout Timed Run</h3>
        <p>Sessions: {speedrun.sessions}</p>
        {speedrun.ranges.length === 0 ? <p className="muted">No sessions yet.</p> : null}
        {speedrun.ranges.map((item) => (
          <div key={item.rangeLabel} className="breakdown-item">
            <span>{item.rangeLabel}</span>
            <span>Best {formatClock(item.bestTime)}</span>
            <span>
              Latest {formatClock(item.latestTime)} ({item.successRate.toFixed(1)}%)
            </span>
          </div>
        ))}
        {speedrun.fastest ? (
          <p>
            Fastest checkout: {speedrun.fastest.checkout} in {formatSeconds(speedrun.fastest.seconds)}
          </p>
        ) : null}
        {speedrun.slowest ? (
          <p>
            Slowest checkout: {speedrun.slowest.checkout} in {formatSeconds(speedrun.slowest.seconds)}
          </p>
        ) : null}
      </Card>

      <Card>
        <h3>Around the Clock</h3>
        <p>Sessions: {around.sessions}</p>
        {around.modes.length === 0 ? <p className="muted">No sessions yet.</p> : null}
        {around.modes.map((item) => (
          <div key={item.mode} className="breakdown-item">
            <span>{item.mode}</span>
            <span>Best {formatClock(item.bestTime)}</span>
            <span>
              Latest {formatClock(item.latestTime)} / Avg {formatClock(item.averageTime)}
            </span>
          </div>
        ))}
        {around.modes.some((item) => item.latestEstimatedDarts !== null) ? (
          <p>
            Latest estimated darts:{" "}
            {around.modes
              .filter((item) => item.latestEstimatedDarts !== null)
              .map((item) => `${item.mode} ~${item.latestEstimatedDarts}`)
              .join(" | ")}
          </p>
        ) : null}
        {around.fastest ? (
          <p>
            Fastest target/sector: {around.fastest.target} in {formatSeconds(around.fastest.seconds)}
          </p>
        ) : null}
        {around.slowest ? (
          <p>
            Slowest target/sector: {around.slowest.target} in {formatSeconds(around.slowest.seconds)}
          </p>
        ) : null}
      </Card>
    </div>
  );
}
