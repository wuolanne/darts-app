import { PreferredDouble } from "../../types/models";
import { formatRoute, getCheckoutRoutes, normalizeDartTarget, scoreOfTarget } from "../../utils/checkoutLibrary";
import { existsCheckout } from "./solver";
import { RankedRoute, SegmentCode } from "./types";

const AWKWARD_FINAL_DOUBLES = new Set(["D1", "D2", "D3", "D5", "D7", "D11", "D13", "D15", "D17", "D19"]);
const STRONG_FINAL_DOUBLES = new Set(["D20", "D16", "D18", "D12", "D10", "D8"]);

function keyOf(route: SegmentCode[]): string {
  return route.map((target) => normalizeDartTarget(target)).join("|");
}

function classBaseScore(routeClass: RankedRoute["routeClass"]): number {
  if (routeClass === "optimal") return 25;
  if (routeClass === "proAlternative") return 20;
  if (routeClass === "highQualityCustom") return 16;
  if (routeClass === "validCustom") return 12;
  return 8;
}

function xpExplanation(quality: number, routeClass: RankedRoute["routeClass"]): string {
  if (quality >= 96) return "Perfect route. This matches the strongest known checkout line.";
  if (quality >= 80) return routeClass === "proAlternative"
    ? "Great checkout. This is a strong known alternative."
    : "Great checkout. The route was clean and finishable.";
  if (quality >= 60) return "Checkout complete, but a cleaner route was available.";
  return "Checkout complete, but the route carried avoidable risk.";
}

function routeClassFor(route: SegmentCode[], startScore: number, preferredDouble: PreferredDouble): RankedRoute["routeClass"] {
  const routeKey = keyOf(route);
  const curated = getCheckoutRoutes(startScore, preferredDouble).filter((item) => !item.isBogey && item.route.length > 0);
  const matchIndex = curated.findIndex((item) => keyOf(item.route) === routeKey);
  if (matchIndex === 0) return "optimal";
  if (matchIndex > 0) return "proAlternative";

  const final = route[route.length - 1] ? normalizeDartTarget(route[route.length - 1]) : "";
  const hasAwkwardFinal = AWKWARD_FINAL_DOUBLES.has(final);
  const hasMiddleDoubleOrBull = route.slice(0, -1).some((target) => {
    const normalized = normalizeDartTarget(target);
    return normalized === "Bull" || normalized.startsWith("D");
  });

  if (!hasAwkwardFinal && !hasMiddleDoubleOrBull && STRONG_FINAL_DOUBLES.has(final)) {
    return "highQualityCustom";
  }
  if (!hasAwkwardFinal && !hasMiddleDoubleOrBull) return "validCustom";
  return "awkwardCustom";
}

function leaveQuality(route: SegmentCode[], startScore: number): number {
  if (route.length <= 1) return 15;
  let remaining = startScore;
  const scores: number[] = [];

  for (let index = 0; index < route.length - 1; index += 1) {
    const value = scoreOfTarget(route[index]) ?? 0;
    remaining -= value;
    const dartsLeft = route.length - index - 1;
    if (remaining <= 1) {
      scores.push(0);
    } else if (existsCheckout(remaining, dartsLeft)) {
      if (remaining === 50) scores.push(1);
      else if (remaining % 2 === 0) scores.push(0.85);
      else scores.push(0.65);
    } else {
      scores.push(0);
    }
  }

  const average = scores.reduce((sum, value) => sum + value, 0) / scores.length;
  return Math.round(average * 15);
}

function missManagement(route: SegmentCode[], startScore: number): number {
  const first = normalizeDartTarget(route[0] ?? "");
  const treble = first.match(/^T(\d{1,2})$/);
  if (!treble) return 6;

  const singleScore = Number(treble[1]);
  const remaining = startScore - singleScore;
  const dartsLeft = route.length - 1;
  if (remaining === 50) return 10;
  if (existsCheckout(remaining, dartsLeft)) return 8;
  return 2;
}

function riskProfile(route: SegmentCode[], preferredDouble: PreferredDouble): number {
  const final = normalizeDartTarget(route[route.length - 1] ?? "");
  let score = 4;
  if (AWKWARD_FINAL_DOUBLES.has(final)) score -= 2;
  if (final === "Bull" && route.length < 3) score -= 1;
  if (preferredDouble !== "Not sure" && final === preferredDouble) score += 1;
  if (route.slice(0, -1).some((target) => normalizeDartTarget(target).startsWith("D"))) score -= 1;
  return Math.max(0, Math.min(5, score));
}

export function rankRoute(
  startScore: number,
  route: SegmentCode[],
  preferredDouble: PreferredDouble
): RankedRoute {
  const routeClass = routeClassFor(route, startScore, preferredDouble);
  const legal = 45;
  const quality = Math.max(
    0,
    Math.min(
      100,
      legal +
        classBaseScore(routeClass) +
        leaveQuality(route, startScore) +
        missManagement(route, startScore) +
        riskProfile(route, preferredDouble)
    )
  );

  return {
    path: route.map((target) => normalizeDartTarget(target)),
    quality,
    routeClass,
    explanation: xpExplanation(quality, routeClass)
  };
}

export function rankRoutes(
  startScore: number,
  routes: SegmentCode[][],
  preferredDouble: PreferredDouble
): RankedRoute[] {
  return routes
    .map((route) => rankRoute(startScore, route, preferredDouble))
    .sort((a, b) => b.quality - a.quality || formatRoute(a.path).localeCompare(formatRoute(b.path)));
}

export function xpFromQuality(quality: number): 0 | 1 | 2 | 3 {
  if (quality >= 96) return 3;
  if (quality >= 80) return 2;
  if (quality >= 60) return 1;
  return 0;
}

export function pathEquals(a: SegmentCode[], b: SegmentCode[]): boolean {
  return keyOf(a) === keyOf(b);
}

