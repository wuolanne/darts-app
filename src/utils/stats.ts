import {
  AroundClockSession,
  CheckoutAttempt,
  CheckoutSpeedrunEntry,
  CheckoutSpeedrunSession,
  StatsRange
} from "../types/models";

const DAY_MS = 24 * 60 * 60 * 1000;

function cutoff(range: StatsRange): number {
  const now = Date.now();
  if (range === "7d") {
    return now - 7 * DAY_MS;
  }
  if (range === "30d") {
    return now - 30 * DAY_MS;
  }
  return 0;
}

function applyDateFilter<T extends { timestamp: string }>(rows: T[], range: StatsRange): T[] {
  if (range === "total") {
    return rows;
  }
  const from = cutoff(range);
  return rows.filter((row) => new Date(row.timestamp).getTime() >= from);
}

export function getCheckoutStats(attempts: CheckoutAttempt[], range: StatsRange) {
  const filtered = applyDateFilter(attempts, range);
  const attemptsCount = filtered.length;
  const finished = filtered.filter((a) => a.result === "finished").length;
  const goodLeave = filtered.filter((a) => a.result === "good_leave").length;
  const bust = filtered.filter((a) => a.result === "bust").length;
  const elapsed = filtered
    .map((a) => a.elapsedSeconds)
    .filter((value): value is number => typeof value === "number");
  const averageAttemptTime =
    elapsed.length > 0 ? elapsed.reduce((sum, value) => sum + value, 0) / elapsed.length : null;

  return {
    attemptsCount,
    successRate: attemptsCount > 0 ? (finished / attemptsCount) * 100 : 0,
    goodLeaveRate: attemptsCount > 0 ? (goodLeave / attemptsCount) * 100 : 0,
    bustRate: attemptsCount > 0 ? (bust / attemptsCount) * 100 : 0,
    averageAttemptTime
  };
}

interface SpeedrunRangeStats {
  rangeLabel: string;
  sessions: number;
  bestTime: number;
  latestTime: number;
  successRate: number;
}

function flattenSpeedrunEntries(sessions: CheckoutSpeedrunSession[]): CheckoutSpeedrunEntry[] {
  return sessions.flatMap((session) => session.entries);
}

export function getSpeedrunStats(sessions: CheckoutSpeedrunSession[], range: StatsRange) {
  const filtered = applyDateFilter(sessions, range);
  const byRange = new Map<string, SpeedrunRangeStats>();
  const allEntries = flattenSpeedrunEntries(filtered);

  for (const session of filtered) {
    const total = session.entries.length;
    const finished = session.entries.filter((entry) => entry.result === "finished").length;
    const existing = byRange.get(session.rangeLabel);
    if (!existing) {
      byRange.set(session.rangeLabel, {
        rangeLabel: session.rangeLabel,
        sessions: 1,
        bestTime: session.totalActiveSeconds,
        latestTime: session.totalActiveSeconds,
        successRate: total > 0 ? (finished / total) * 100 : 0
      });
      continue;
    }

    const aggregateSessions = existing.sessions + 1;
    byRange.set(session.rangeLabel, {
      rangeLabel: session.rangeLabel,
      sessions: aggregateSessions,
      bestTime: Math.min(existing.bestTime, session.totalActiveSeconds),
      latestTime: session.totalActiveSeconds,
      successRate:
        (existing.successRate * existing.sessions + (total > 0 ? (finished / total) * 100 : 0)) /
        aggregateSessions
    });
  }

  const fastest = allEntries.reduce<CheckoutSpeedrunEntry | null>((best, current) => {
    if (!best || current.seconds < best.seconds) {
      return current;
    }
    return best;
  }, null);

  const slowest = allEntries.reduce<CheckoutSpeedrunEntry | null>((worst, current) => {
    if (!worst || current.seconds > worst.seconds) {
      return current;
    }
    return worst;
  }, null);

  return {
    sessions: filtered.length,
    ranges: Array.from(byRange.values()),
    fastest,
    slowest
  };
}

interface AroundModeStats {
  mode: string;
  sessions: number;
  bestTime: number;
  latestTime: number;
  averageTime: number;
}

export function getAroundClockStats(sessions: AroundClockSession[], range: StatsRange) {
  const filtered = applyDateFilter(sessions, range);
  const byMode = new Map<string, AroundModeStats>();
  const allEntries = filtered.flatMap((session) => session.entries);

  for (const session of filtered) {
    const modeKey =
      session.mode === "full_sector"
        ? `full_sector (${session.doubleRequirement === 2 ? "2 doubles" : "1 double"})`
        : session.mode;
    const existing = byMode.get(modeKey);
    if (!existing) {
      byMode.set(modeKey, {
        mode: modeKey,
        sessions: 1,
        bestTime: session.totalActiveSeconds,
        latestTime: session.totalActiveSeconds,
        averageTime: session.totalActiveSeconds
      });
      continue;
    }

    const nextSessions = existing.sessions + 1;
    byMode.set(modeKey, {
      mode: modeKey,
      sessions: nextSessions,
      bestTime: Math.min(existing.bestTime, session.totalActiveSeconds),
      latestTime: session.totalActiveSeconds,
      averageTime:
        (existing.averageTime * existing.sessions + session.totalActiveSeconds) / nextSessions
    });
  }

  const fastest = allEntries.reduce<{ target: string; seconds: number } | null>((best, current) => {
    if (!best || current.seconds < best.seconds) {
      return { target: current.target, seconds: current.seconds };
    }
    return best;
  }, null);

  const slowest = allEntries.reduce<{ target: string; seconds: number } | null>((worst, current) => {
    if (!worst || current.seconds > worst.seconds) {
      return { target: current.target, seconds: current.seconds };
    }
    return worst;
  }, null);

  return {
    sessions: filtered.length,
    modes: Array.from(byMode.values()),
    fastest,
    slowest
  };
}
