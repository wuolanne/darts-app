import { ALL_HITS } from "./segments";
import { SegmentCode } from "./types";

const routeCache = new Map<string, SegmentCode[][]>();

function cacheKey(score: number, dartsAvailable: number): string {
  return `${score}:${dartsAvailable}`;
}

export function generateValidRoutes(startScore: number, dartsAvailable: number): SegmentCode[][] {
  const key = cacheKey(startScore, dartsAvailable);
  const cached = routeCache.get(key);
  if (cached) return cached.map((route) => [...route]);

  const routes: SegmentCode[][] = [];

  function dfs(remaining: number, dartsLeft: number, path: SegmentCode[]) {
    if (dartsLeft <= 0) return;

    for (const hit of ALL_HITS) {
      const next = remaining - hit.value;
      if (next < 0 || next === 1) continue;

      if (next === 0) {
        if (hit.isFinish) {
          routes.push([...path, hit.code]);
        }
        continue;
      }

      if (dartsLeft > 1) {
        dfs(next, dartsLeft - 1, [...path, hit.code]);
      }
    }
  }

  dfs(startScore, dartsAvailable, []);
  routeCache.set(key, routes);
  return routes.map((route) => [...route]);
}

export function existsCheckout(score: number, dartsLeft: number): boolean {
  if (score < 2 || score > 170 || dartsLeft <= 0) return false;
  return generateValidRoutes(score, dartsLeft).length > 0;
}

