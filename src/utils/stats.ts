import {
  AroundClockMode,
  AroundClockSession,
  CheckoutAttempt,
  CheckoutRangeKey,
  CheckoutSpeedrunEntry,
  CheckoutSpeedrunSession,
  StatsRange
} from "../types/models";

const DAY_MS = 24 * 60 * 60 * 1000;

type RowByRange = {
  rangeLabel: string;
  attempts: number;
  successRate: number;
  averageTime: number | null;
};

type MiniRangeRow = {
  rangeLabel: string;
  attempts: number;
  successRate: number | null;
};

type RowByFinish = {
  finish: number;
  attempts: number;
  successRate: number;
  averageTime: number | null;
};

type SpeedrunRangeRow = {
  rangeLabel: string;
  sessions: number;
  bestTime: number;
  averageTime: number;
  latestTime: number;
};

type SpeedrunFinishRow = {
  finish: number;
  attempts: number;
  completions: number;
  bestTime: number;
  averageTime: number;
};

type BestRunRow = {
  id: string;
  timestamp: string;
  rangeLabel: string;
  completed: number;
  total: number;
  totalTime: number;
  averageCheckout: number | null;
};

type BestPerformanceByRangeRow = {
  rangeLabel: string;
  timestamp: string;
  totalTime: number;
};

type AroundModeRow = {
  mode: string;
  sessions: number;
  best: number;
  latest: number;
  average: number;
};

type AroundTargetRow = {
  mode: string;
  key: string;
  best: number;
  latest: number;
  average: number;
};

type AroundTargetGroup = {
  mode: string;
  rows: AroundTargetRow[];
};

function cutoff(range: StatsRange): number {
  const now = Date.now();
  if (range === "7d") return now - 7 * DAY_MS;
  if (range === "30d") return now - 30 * DAY_MS;
  return 0;
}

function applyDateFilter<T extends { timestamp: string }>(rows: T[], range: StatsRange): T[] {
  if (range === "total") return rows;
  const from = cutoff(range);
  return rows.filter((row) => new Date(row.timestamp).getTime() >= from);
}

function safeAverage(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toModeLabel(mode: AroundClockMode, doubleRequirement: 1 | 2 | null): string {
  if (mode === "singles") return "Singles";
  if (mode === "doubles") return "Doubles";
  if (mode === "trebles") return "Trebles";
  if (mode === "common_doubles") return "Common Doubles";
  if (mode === "custom") return "Custom";
  if (doubleRequirement === 2) return "Full Sector (2 doubles)";
  return "Full Sector (1 double)";
}

function normalizeAroundTarget(mode: AroundClockMode, target: string): string {
  if (mode !== "full_sector") return target;
  if (target === "Bull/25" || target === "25/Bull" || target === "Bull" || target === "25") {
    return "Bull/25";
  }
  const sectorMatch = target.match(/^S(\d{1,2})\s\+\sT\1\s\+\sD\1(?:\s\+\sD\1)?$/);
  if (sectorMatch) {
    return `Sector ${Number(sectorMatch[1])}`;
  }
  return target.startsWith("Sector ") ? target : target;
}

function aroundTargetGroupLabel(mode: AroundClockMode): string {
  if (mode === "singles") return "Singles";
  if (mode === "doubles") return "Doubles";
  if (mode === "trebles") return "Trebles";
  if (mode === "common_doubles") return "Common Doubles";
  if (mode === "custom") return "Custom";
  return "Full Sector";
}

function rangeOrder(label: string): number {
  const known = ["61-70", "71-80", "81-90", "91-100", "101-120", "121-140", "141-170", "All"];
  const index = known.indexOf(label);
  if (index >= 0) return index;
  if (label.toLowerCase().includes("custom")) return 99;
  return 90;
}

export function getCheckoutStats(attempts: CheckoutAttempt[], range: StatsRange) {
  const filtered = applyDateFilter(attempts, range);
  const attemptsCount = filtered.length;
  const finishedCount = filtered.filter((a) => a.result === "finished").length;
  const failedCount = filtered.filter((a) => a.result === "failed").length;
  const bustCount = filtered.filter((a) => a.result === "bust").length;
  const elapsed = filtered
    .map((a) => a.elapsedSeconds)
    .filter((value): value is number => typeof value === "number");
  const averageAttemptTime = safeAverage(elapsed);
  const bestAttemptTime = elapsed.length > 0 ? Math.min(...elapsed) : null;

  const ranges = new Map<CheckoutRangeKey, CheckoutAttempt[]>();
  for (const attempt of filtered) {
    const group = ranges.get(attempt.range) ?? [];
    group.push(attempt);
    ranges.set(attempt.range, group);
  }
  const byRange: RowByRange[] = Array.from(ranges.entries())
    .map(([rangeKey, items]) => {
      const times = items
        .map((item) => item.elapsedSeconds)
        .filter((value): value is number => typeof value === "number");
      const successes = items.filter((item) => item.result === "finished").length;
      return {
        rangeLabel: rangeKey === "all" ? "All" : rangeKey === "custom" ? "Custom" : rangeKey,
        attempts: items.length,
        successRate: items.length > 0 ? (successes / items.length) * 100 : 0,
        averageTime: safeAverage(times)
      };
    })
    .sort((a, b) => rangeOrder(a.rangeLabel) - rangeOrder(b.rangeLabel));

  const byFinishMap = new Map<number, CheckoutAttempt[]>();
  for (const attempt of filtered) {
    const list = byFinishMap.get(attempt.finishNumber) ?? [];
    list.push(attempt);
    byFinishMap.set(attempt.finishNumber, list);
  }
  const byFinish: RowByFinish[] = Array.from(byFinishMap.entries())
    .map(([finish, items]) => {
      const times = items
        .map((item) => item.elapsedSeconds)
        .filter((value): value is number => typeof value === "number");
      const successes = items.filter((item) => item.result === "finished").length;
      return {
        finish,
        attempts: items.length,
        successRate: items.length > 0 ? (successes / items.length) * 100 : 0,
        averageTime: safeAverage(times)
      };
    })
    .sort((a, b) => b.attempts - a.attempts || a.finish - b.finish);

  const bestFinishes = [...byFinish]
    .sort((a, b) => b.successRate - a.successRate || a.averageTime === null || b.averageTime === null ? 0 : a.averageTime - b.averageTime)
    .slice(0, 5);

  const problemFinishes = [...byFinish]
    .sort((a, b) => a.successRate - b.successRate || b.attempts - a.attempts)
    .slice(0, 5);

  const quickMiniRanges = [
    { label: "61-80", min: 61, max: 80 },
    { label: "81-100", min: 81, max: 100 },
    { label: "101-120", min: 101, max: 120 },
    { label: "121-140", min: 121, max: 140 }
  ] as const;

  const miniByRange: MiniRangeRow[] = quickMiniRanges.map((bucket) => {
    const items = filtered.filter(
      (attempt) => attempt.finishNumber >= bucket.min && attempt.finishNumber <= bucket.max
    );
    const itemAttempts = items.length;
    const itemSuccesses = items.filter((attempt) => attempt.result === "finished").length;
    return {
      rangeLabel: bucket.label,
      attempts: itemAttempts,
      successRate: itemAttempts > 0 ? (itemSuccesses / itemAttempts) * 100 : null
    };
  });

  return {
    attemptsCount,
    successRate: attemptsCount > 0 ? (finishedCount / attemptsCount) * 100 : 0,
    wrongRate: attemptsCount > 0 ? (failedCount / attemptsCount) * 100 : 0,
    bustRate: attemptsCount > 0 ? (bustCount / attemptsCount) * 100 : 0,
    averageAttemptTime,
    bestAttemptTime,
    byRange,
    miniByRange,
    byFinish,
    bestFinishes,
    problemFinishes,
    hasFirstTargetData: false
  };
}

function flattenSpeedrunEntries(sessions: CheckoutSpeedrunSession[]): CheckoutSpeedrunEntry[] {
  return sessions.flatMap((session) => session.entries);
}

export function getSpeedrunStats(sessions: CheckoutSpeedrunSession[], range: StatsRange) {
  const filtered = applyDateFilter(sessions, range);
  const byRangeMap = new Map<string, CheckoutSpeedrunSession[]>();
  for (const session of filtered) {
    const list = byRangeMap.get(session.rangeLabel) ?? [];
    list.push(session);
    byRangeMap.set(session.rangeLabel, list);
  }

  const byRange: SpeedrunRangeRow[] = Array.from(byRangeMap.entries())
    .map(([rangeLabel, items]) => {
      const totals = items.map((item) => item.totalActiveSeconds);
      const latest = [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      return {
        rangeLabel,
        sessions: items.length,
        bestTime: Math.min(...totals),
        averageTime: totals.reduce((sum, value) => sum + value, 0) / totals.length,
        latestTime: latest.totalActiveSeconds
      };
    })
    .sort((a, b) => rangeOrder(a.rangeLabel) - rangeOrder(b.rangeLabel));

  const allEntries = flattenSpeedrunEntries(filtered);
  const finishedEntries = allEntries.filter((entry) => entry.result === "finished");
  const allCheckoutSeconds = allEntries.map((entry) => entry.seconds);

  const byFinishMap = new Map<number, CheckoutSpeedrunEntry[]>();
  for (const entry of allEntries) {
    const list = byFinishMap.get(entry.checkout) ?? [];
    list.push(entry);
    byFinishMap.set(entry.checkout, list);
  }
  const byFinish: SpeedrunFinishRow[] = Array.from(byFinishMap.entries())
    .map(([finish, entries]) => {
      const completions = entries.filter((entry) => entry.result === "finished");
      return {
        finish,
        attempts: entries.length,
        completions: completions.length,
        bestTime: completions.length > 0 ? Math.min(...completions.map((entry) => entry.seconds)) : Math.min(...entries.map((entry) => entry.seconds)),
        averageTime: entries.reduce((sum, entry) => sum + entry.seconds, 0) / entries.length
      };
    });

  const fastestFinishes = [...byFinish]
    .sort((a, b) => a.bestTime - b.bestTime)
    .slice(0, 5);
  const slowestFinishes = [...byFinish]
    .sort((a, b) => b.averageTime - a.averageTime)
    .slice(0, 5);
  const mostPracticedFinishes = [...byFinish]
    .sort((a, b) => b.attempts - a.attempts || a.finish - b.finish)
    .slice(0, 5);

  const sortedByDate = [...filtered].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const bestRuns: BestRunRow[] = sortedByDate.slice(0, 5).map((session) => {
    const completed = session.entries.filter((entry) => entry.result === "finished").length;
    const avg = safeAverage(session.entries.map((entry) => entry.seconds));
    return {
      id: session.id,
      timestamp: session.timestamp,
      rangeLabel: session.rangeLabel,
      completed,
      total: session.entries.length,
      totalTime: session.totalActiveSeconds,
      averageCheckout: avg
    };
  });

  const latestSession = sortedByDate[0] ?? null;
  const totalTimes = filtered.map((session) => session.totalActiveSeconds);
  const overallAverage = safeAverage(totalTimes);
  const overallBest = totalTimes.length > 0 ? Math.min(...totalTimes) : null;
  const averageCheckoutTime = safeAverage(allCheckoutSeconds);
  const bestPerformanceByRange: BestPerformanceByRangeRow[] = Array.from(byRangeMap.entries())
    .map(([rangeLabel, items]) => {
      const best = [...items]
        .filter((item) => item.totalActiveSeconds > 0)
        .sort((a, b) => a.totalActiveSeconds - b.totalActiveSeconds || new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
      if (!best) return null;
      return {
        rangeLabel,
        timestamp: best.timestamp,
        totalTime: best.totalActiveSeconds
      };
    })
    .filter((item): item is BestPerformanceByRangeRow => item !== null)
    .sort((a, b) => rangeOrder(a.rangeLabel) - rangeOrder(b.rangeLabel));

  return {
    sessions: filtered.length,
    overallBestTime: overallBest,
    latestTotalTime: latestSession?.totalActiveSeconds ?? null,
    averageTotalTime: overallAverage,
    averageCheckoutTime,
    completedCheckouts: finishedEntries.length,
    byRange,
    byFinish,
    fastestFinishes,
    slowestFinishes,
    mostPracticedFinishes,
    bestRuns,
    bestPerformanceByRange
  };
}

export function getAroundClockStats(sessions: AroundClockSession[], range: StatsRange) {
  const filtered = applyDateFilter(sessions, range);
  const sortedByDate = [...filtered].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const byModeMap = new Map<string, AroundClockSession[]>();
  for (const session of filtered) {
    const key = toModeLabel(session.mode, session.doubleRequirement);
    const list = byModeMap.get(key) ?? [];
    list.push(session);
    byModeMap.set(key, list);
  }

  const byMode: AroundModeRow[] = Array.from(byModeMap.entries())
    .map(([label, items]) => {
      const totals = items.map((item) => item.totalActiveSeconds);
      const latest = [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      return {
        mode: label,
        sessions: items.length,
        best: Math.min(...totals),
        latest: latest.totalActiveSeconds,
        average: totals.reduce((sum, value) => sum + value, 0) / totals.length
      };
    })
    .sort((a, b) => a.mode.localeCompare(b.mode));

  const entryMap = new Map<string, { mode: string; key: string; seconds: number; timestamp: string }[]>();
  for (const session of filtered) {
    for (const entry of session.entries) {
      if (entry.seconds <= 0) continue;
      const mode = aroundTargetGroupLabel(session.mode);
      const key = normalizeAroundTarget(session.mode, entry.target);
      const aggregateKey = `${mode}::${key}`;
      const list = entryMap.get(aggregateKey) ?? [];
      list.push({ mode, key, seconds: entry.seconds, timestamp: session.timestamp });
      entryMap.set(aggregateKey, list);
    }
  }

  const byTarget: AroundTargetRow[] = Array.from(entryMap.entries())
    .map(([, rows]) => {
      const sorted = [...rows].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const values = rows.map((row) => row.seconds);
      return {
        mode: rows[0].mode,
        key: rows[0].key,
        best: Math.min(...values),
        latest: sorted[0].seconds,
        average: values.reduce((sum, value) => sum + value, 0) / values.length
      };
    });

  const modeOrder = ["Singles", "Doubles", "Trebles", "Common Doubles", "Custom", "Full Sector"];
  const byTargetGroupedMap = new Map<string, AroundTargetRow[]>();
  for (const row of byTarget) {
    const list = byTargetGroupedMap.get(row.mode) ?? [];
    list.push(row);
    byTargetGroupedMap.set(row.mode, list);
  }
  const byTargetGrouped: AroundTargetGroup[] = Array.from(byTargetGroupedMap.entries())
    .map(([mode, rows]) => ({
      mode,
      rows: [...rows].sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }))
    }))
    .sort((a, b) => modeOrder.indexOf(a.mode) - modeOrder.indexOf(b.mode));

  const fastest = byTarget.length > 0 ? [...byTarget].sort((a, b) => a.best - b.best)[0] : null;
  const slowest = byTarget.length > 0 ? [...byTarget].sort((a, b) => b.average - a.average)[0] : null;

  const totalTimes = filtered.map((session) => session.totalActiveSeconds);
  const latestSession = sortedByDate[0] ?? null;

  return {
    sessions: filtered.length,
    bestTotalTime: totalTimes.length > 0 ? Math.min(...totalTimes) : null,
    latestTotalTime: latestSession?.totalActiveSeconds ?? null,
    averageTotalTime: safeAverage(totalTimes),
    latestEstimatedDarts: latestSession?.estimatedDarts ?? null,
    byMode,
    byTarget,
    byTargetGrouped,
    fastest,
    slowest
  };
}
