import { PreferredDouble } from "../types/models";

export type DartTarget = string;
export type PreferredDoubleTarget = Exclude<PreferredDouble, "Not sure">;

export type SingleHitContinuation = {
  singleHitTarget: DartTarget;
  remaining: number;
  continuationRoute: DartTarget[];
  note?: string;
};

export type CheckoutRouteAlternative = {
  label: string;
  route: DartTarget[];
  singleHitContinuation?: SingleHitContinuation;
  note?: string;
  preferredDouble?: PreferredDoubleTarget;
};

export type CheckoutRoute = {
  finish: number;
  isBogey?: boolean;
  label: string;
  route: DartTarget[];
  singleHitContinuation?: SingleHitContinuation;
  alternativeRoutes?: CheckoutRouteAlternative[];
  preferredDouble?: PreferredDoubleTarget;
  note?: string;
};

export type CheckoutRouteOption = {
  label: string;
  route: DartTarget[];
  firstTarget: DartTarget;
  singleHitTarget?: DartTarget;
  remainingAfterSingle: number;
  followUpRoute?: DartTarget[];
  note?: string;
  preferredDouble?: PreferredDoubleTarget;
};

export type CheckoutRouteDetails = {
  finish: number;
  routes: CheckoutRouteOption[];
  isBogey?: boolean;
  note?: string;
};

const BOGEY_FINISHES = new Set([159, 162, 163, 165, 166, 168, 169]);

const CHECKOUT_ROUTES: Record<number, CheckoutRoute> = {
  41: { finish: 41, label: "Optimal route", route: ["S9", "D16"] },
  42: { finish: 42, label: "Optimal route", route: ["S10", "D16"] },
  43: { finish: 43, label: "Optimal route", route: ["S11", "D16"] },
  44: { finish: 44, label: "Optimal route", route: ["S12", "D16"] },
  45: { finish: 45, label: "Optimal route", route: ["S13", "D16"] },
  46: { finish: 46, label: "Optimal route", route: ["S14", "D16"] },
  47: { finish: 47, label: "Optimal route", route: ["S15", "D16"] },
  48: { finish: 48, label: "Optimal route", route: ["S16", "D16"] },
  49: { finish: 49, label: "Optimal route", route: ["S17", "D16"] },
  50: {
    finish: 50,
    label: "Optimal route",
    route: ["Bull"],
    alternativeRoutes: [
      {
        label: "Alternative route",
        route: ["S10", "D20"]
      },
      {
        label: "Preferred double route",
        route: ["S18", "D16"],
        preferredDouble: "D16"
      }
    ]
  },
  51: { finish: 51, label: "Optimal route", route: ["S11", "D20"] },
  52: {
    finish: 52,
    label: "Preferred double route",
    route: ["S20", "D16"],
    preferredDouble: "D16",
    alternativeRoutes: [{ label: "Alternative route", route: ["S12", "D20"] }]
  },
  53: { finish: 53, label: "Optimal route", route: ["S13", "D20"] },
  54: { finish: 54, label: "Optimal route", route: ["S14", "D20"] },
  55: { finish: 55, label: "Optimal route", route: ["S15", "D20"] },
  56: { finish: 56, label: "Optimal route", route: ["S16", "D20"] },
  57: { finish: 57, label: "Optimal route", route: ["S17", "D20"] },
  58: { finish: 58, label: "Optimal route", route: ["S18", "D20"] },
  59: { finish: 59, label: "Optimal route", route: ["S19", "D20"] },
  60: { finish: 60, label: "Optimal route", route: ["S20", "D20"] },
  61: {
    finish: 61,
    label: "Optimal route",
    route: ["T15", "D8"],
    alternativeRoutes: [
      {
        label: "Bull-friendly route",
        route: ["T11", "D14"],
        singleHitContinuation: {
          singleHitTarget: "S11",
          remaining: 50,
          continuationRoute: ["Bull"]
        }
      }
    ]
  },
  62: {
    finish: 62,
    label: "Optimal route",
    route: ["T10", "D16"],
    alternativeRoutes: [
      {
        label: "Bull-friendly route",
        route: ["T12", "D13"],
        singleHitContinuation: {
          singleHitTarget: "S12",
          remaining: 50,
          continuationRoute: ["Bull"]
        }
      }
    ]
  },
  63: {
    finish: 63,
    label: "Optimal route",
    route: ["T13", "D12"],
    singleHitContinuation: {
      singleHitTarget: "S13",
      remaining: 50,
      continuationRoute: ["Bull"]
    }
  },
  64: {
    finish: 64,
    label: "Optimal route",
    route: ["T16", "D8"],
    alternativeRoutes: [
      {
        label: "Bull-friendly route",
        route: ["T14", "D11"],
        singleHitContinuation: {
          singleHitTarget: "S14",
          remaining: 50,
          continuationRoute: ["Bull"]
        }
      }
    ]
  },
  65: {
    finish: 65,
    label: "Optimal route",
    route: ["T15", "D10"],
    singleHitContinuation: {
      singleHitTarget: "S15",
      remaining: 50,
      continuationRoute: ["Bull"]
    },
    alternativeRoutes: [
      {
        label: "Alternative route",
        route: ["T11", "D16"],
        singleHitContinuation: {
          singleHitTarget: "S11",
          remaining: 54,
          continuationRoute: ["S14", "D20"]
        }
      }
    ]
  },
  66: {
    finish: 66,
    label: "Optimal route",
    route: ["T10", "D18"],
    alternativeRoutes: [
      {
        label: "Bull-friendly route",
        route: ["T16", "D9"],
        singleHitContinuation: {
          singleHitTarget: "S16",
          remaining: 50,
          continuationRoute: ["Bull"]
        }
      }
    ]
  },
  67: {
    finish: 67,
    label: "Optimal route",
    route: ["T17", "D8"],
    singleHitContinuation: {
      singleHitTarget: "S17",
      remaining: 50,
      continuationRoute: ["Bull"]
    }
  },
  68: {
    finish: 68,
    label: "Optimal route",
    route: ["T20", "D4"],
    alternativeRoutes: [
      {
        label: "Bull-friendly route",
        route: ["T18", "D7"],
        singleHitContinuation: {
          singleHitTarget: "S18",
          remaining: 50,
          continuationRoute: ["Bull"]
        }
      }
    ]
  },
  69: {
    finish: 69,
    label: "Optimal route",
    route: ["T15", "D12"],
    alternativeRoutes: [
      {
        label: "Bull-friendly route",
        route: ["T19", "D6"],
        singleHitContinuation: {
          singleHitTarget: "S19",
          remaining: 50,
          continuationRoute: ["Bull"]
        }
      }
    ]
  },
  70: {
    finish: 70,
    label: "Optimal route",
    route: ["T18", "D8"],
    alternativeRoutes: [
      {
        label: "Bull-friendly route",
        route: ["T20", "D5"],
        singleHitContinuation: {
          singleHitTarget: "S20",
          remaining: 50,
          continuationRoute: ["Bull"]
        }
      }
    ]
  },
  71: { finish: 71, label: "Optimal route", route: ["T13", "D16"] },
  72: { finish: 72, label: "Optimal route", route: ["T16", "D12"] },
  73: { finish: 73, label: "Optimal route", route: ["T19", "D8"] },
  74: { finish: 74, label: "Optimal route", route: ["T14", "D16"] },
  75: { finish: 75, label: "Optimal route", route: ["T17", "D12"] },
  76: {
    finish: 76,
    label: "Optimal route",
    route: ["T20", "D8"],
    singleHitContinuation: {
      singleHitTarget: "S20",
      remaining: 56,
      continuationRoute: ["S16", "D20"]
    }
  },
  77: { finish: 77, label: "Optimal route", route: ["T19", "D10"] },
  78: { finish: 78, label: "Optimal route", route: ["T18", "D12"] },
  79: { finish: 79, label: "Optimal route", route: ["T19", "D11"] },
  80: { finish: 80, label: "Optimal route", route: ["T20", "D10"] },
  81: {
    finish: 81,
    label: "Optimal route",
    route: ["T19", "D12"],
    singleHitContinuation: {
      singleHitTarget: "S19",
      remaining: 62,
      continuationRoute: ["T12", "D13"]
    },
    alternativeRoutes: [
      {
        label: "Alternative route",
        route: ["T15", "D18"],
        singleHitContinuation: {
          singleHitTarget: "S15",
          remaining: 66,
          continuationRoute: ["T16", "D9"]
        }
      }
    ]
  },
  82: { finish: 82, label: "Optimal route", route: ["T14", "D20"] },
  83: { finish: 83, label: "Optimal route", route: ["T17", "D16"] },
  84: { finish: 84, label: "Optimal route", route: ["T20", "D12"] },
  85: { finish: 85, label: "Optimal route", route: ["T15", "D20"] },
  86: { finish: 86, label: "Optimal route", route: ["T18", "D16"] },
  87: {
    finish: 87,
    label: "Optimal route",
    route: ["T17", "D18"],
    singleHitContinuation: {
      singleHitTarget: "S17",
      remaining: 70,
      continuationRoute: ["T18", "D8"]
    }
  },
  88: {
    finish: 88,
    label: "Optimal route",
    route: ["T16", "D20"],
    alternativeRoutes: [{ label: "Alternative route", route: ["T20", "D14"] }]
  },
  89: {
    finish: 89,
    label: "Optimal route",
    route: ["T19", "D16"],
    alternativeRoutes: [{ label: "Alternative route", route: ["T17", "D19"] }]
  },
  90: {
    finish: 90,
    label: "Optimal route",
    route: ["T20", "D15"],
    alternativeRoutes: [{ label: "Alternative route", route: ["T18", "D18"] }]
  },
  91: { finish: 91, label: "Optimal route", route: ["T17", "D20"] },
  92: { finish: 92, label: "Optimal route", route: ["T20", "D16"] },
  93: { finish: 93, label: "Optimal route", route: ["T19", "D18"] },
  94: { finish: 94, label: "Optimal route", route: ["T18", "D20"] },
  95: { finish: 95, label: "Optimal route", route: ["T19", "D19"] },
  96: { finish: 96, label: "Optimal route", route: ["T20", "D18"] },
  97: { finish: 97, label: "Optimal route", route: ["T19", "D20"] },
  98: { finish: 98, label: "Optimal route", route: ["T20", "D19"] },
  99: {
    finish: 99,
    label: "Optimal route",
    route: ["T19", "S10", "D16"],
    singleHitContinuation: {
      singleHitTarget: "S19",
      remaining: 80,
      continuationRoute: ["T20", "D10"]
    }
  },
  100: {
    finish: 100,
    label: "Optimal route",
    route: ["T20", "D20"],
    singleHitContinuation: {
      singleHitTarget: "S20",
      remaining: 80,
      continuationRoute: ["T20", "D10"]
    },
    alternativeRoutes: [
      {
        label: "D16 setup route",
        route: ["T20", "S8", "D16"],
        singleHitContinuation: {
          singleHitTarget: "S20",
          remaining: 80,
          continuationRoute: ["T20", "D10"]
        },
        preferredDouble: "D16"
      }
    ]
  },
  101: { finish: 101, label: "Optimal route", route: ["T20", "S1", "D20"] },
  102: { finish: 102, label: "Optimal route", route: ["T20", "S10", "D16"] },
  103: { finish: 103, label: "Optimal route", route: ["T20", "S3", "D20"] },
  104: { finish: 104, label: "Optimal route", route: ["T18", "S18", "D16"] },
  105: { finish: 105, label: "Optimal route", route: ["T19", "S16", "D16"] },
  106: { finish: 106, label: "Optimal route", route: ["T20", "S14", "D16"] },
  107: { finish: 107, label: "Optimal route", route: ["T19", "S18", "D16"] },
  108: { finish: 108, label: "Optimal route", route: ["T20", "S16", "D16"] },
  109: { finish: 109, label: "Optimal route", route: ["T19", "S20", "D16"] },
  110: { finish: 110, label: "Optimal route", route: ["T20", "S18", "D16"] },
  111: { finish: 111, label: "Optimal route", route: ["T20", "S19", "D16"] },
  112: { finish: 112, label: "Optimal route", route: ["T20", "S12", "D20"] },
  113: { finish: 113, label: "Optimal route", route: ["T20", "S13", "D20"] },
  114: { finish: 114, label: "Optimal route", route: ["T20", "S14", "D20"] },
  115: { finish: 115, label: "Optimal route", route: ["T20", "S15", "D20"] },
  116: { finish: 116, label: "Optimal route", route: ["T20", "S16", "D20"] },
  117: { finish: 117, label: "Optimal route", route: ["T20", "S17", "D20"] },
  118: { finish: 118, label: "Optimal route", route: ["T20", "S18", "D20"] },
  119: { finish: 119, label: "Optimal route", route: ["T19", "T10", "D16"] },
  120: { finish: 120, label: "Optimal route", route: ["T20", "S20", "D20"] },
  121: {
    finish: 121,
    label: "Optimal route",
    route: ["T17", "T10", "D20"]
  },
  122: {
    finish: 122,
    label: "Optimal route",
    route: ["T18", "T20", "D4"],
    singleHitContinuation: {
      singleHitTarget: "S18",
      remaining: 104,
      continuationRoute: ["T18", "Bull"]
    }
  },
  123: { finish: 123, label: "Optimal route", route: ["T19", "T16", "D9"] },
  124: { finish: 124, label: "Optimal route", route: ["T20", "T16", "D8"] },
  125: { finish: 125, label: "Optimal route", route: ["25", "T20", "D20"] },
  126: { finish: 126, label: "Optimal route", route: ["T19", "T19", "D6"] },
  127: { finish: 127, label: "Optimal route", route: ["T20", "T17", "D8"] },
  128: { finish: 128, label: "Optimal route", route: ["T18", "T14", "D16"] },
  129: { finish: 129, label: "Optimal route", route: ["T19", "T16", "D12"] },
  130: { finish: 130, label: "Optimal route", route: ["T20", "T20", "D5"] },
  131: { finish: 131, label: "Optimal route", route: ["T20", "T13", "D16"] },
  132: { finish: 132, label: "Optimal route", route: ["T20", "T16", "D12"] },
  133: { finish: 133, label: "Optimal route", route: ["T20", "T19", "D8"] },
  134: { finish: 134, label: "Optimal route", route: ["T20", "T14", "D16"] },
  135: { finish: 135, label: "Optimal route", route: ["T20", "T17", "D12"] },
  136: { finish: 136, label: "Optimal route", route: ["T20", "T20", "D8"] },
  137: {
    finish: 137,
    label: "Optimal route",
    route: ["T20", "T19", "D10"],
    alternativeRoutes: [
      {
        label: "Preferred double route",
        route: ["T19", "T16", "D16"],
        preferredDouble: "D16"
      }
    ]
  },
  138: { finish: 138, label: "Optimal route", route: ["T20", "T18", "D12"] },
  139: { finish: 139, label: "Optimal route", route: ["T19", "T14", "D20"] },
  140: {
    finish: 140,
    label: "Optimal route",
    route: ["T20", "T20", "D10"],
    alternativeRoutes: [
      {
        label: "Preferred double route",
        route: ["T20", "T16", "D16"],
        preferredDouble: "D16"
      }
    ]
  },
  141: { finish: 141, label: "Optimal route", route: ["T20", "T19", "D12"] },
  142: { finish: 142, label: "Optimal route", route: ["T20", "T14", "D20"] },
  143: { finish: 143, label: "Optimal route", route: ["T20", "T17", "D16"] },
  144: { finish: 144, label: "Optimal route", route: ["T20", "T20", "D12"] },
  145: { finish: 145, label: "Optimal route", route: ["T20", "T15", "D20"] },
  146: { finish: 146, label: "Optimal route", route: ["T20", "T18", "D16"] },
  147: { finish: 147, label: "Optimal route", route: ["T20", "T17", "D18"] },
  148: { finish: 148, label: "Optimal route", route: ["T20", "T16", "D20"] },
  149: { finish: 149, label: "Optimal route", route: ["T20", "T19", "D16"] },
  150: { finish: 150, label: "Optimal route", route: ["T20", "T18", "D18"] },
  151: { finish: 151, label: "Optimal route", route: ["T20", "T17", "D20"] },
  152: { finish: 152, label: "Optimal route", route: ["T20", "T20", "D16"] },
  153: { finish: 153, label: "Optimal route", route: ["T20", "T19", "D18"] },
  154: { finish: 154, label: "Optimal route", route: ["T20", "T18", "D20"] },
  155: { finish: 155, label: "Optimal route", route: ["T20", "T19", "D19"] },
  156: { finish: 156, label: "Optimal route", route: ["T20", "T20", "D18"] },
  157: { finish: 157, label: "Optimal route", route: ["T20", "T19", "D20"] },
  158: { finish: 158, label: "Optimal route", route: ["T20", "T20", "D19"] },
  159: {
    finish: 159,
    isBogey: true,
    label: "Bogey number",
    route: [],
    note: "Bogey number - cannot be finished in three darts."
  },
  160: { finish: 160, label: "Optimal route", route: ["T20", "T20", "D20"] },
  161: { finish: 161, label: "Optimal route", route: ["T20", "T17", "Bull"] },
  162: {
    finish: 162,
    isBogey: true,
    label: "Bogey number",
    route: [],
    note: "Bogey number - cannot be finished in three darts."
  },
  163: {
    finish: 163,
    isBogey: true,
    label: "Bogey number",
    route: [],
    note: "Bogey number - cannot be finished in three darts."
  },
  164: { finish: 164, label: "Optimal route", route: ["T20", "T18", "Bull"] },
  165: {
    finish: 165,
    isBogey: true,
    label: "Bogey number",
    route: [],
    note: "Bogey number - cannot be finished in three darts."
  },
  166: {
    finish: 166,
    isBogey: true,
    label: "Bogey number",
    route: [],
    note: "Bogey number - cannot be finished in three darts."
  },
  167: { finish: 167, label: "Optimal route", route: ["T20", "T19", "Bull"] },
  168: {
    finish: 168,
    isBogey: true,
    label: "Bogey number",
    route: [],
    note: "Bogey number - cannot be finished in three darts."
  },
  169: {
    finish: 169,
    isBogey: true,
    label: "Bogey number",
    route: [],
    note: "Bogey number - cannot be finished in three darts."
  },
  170: { finish: 170, label: "Optimal route", route: ["T20", "T20", "Bull"] }
};

function singleEquivalent(target: DartTarget): DartTarget | null {
  const normalized = normalizeDartTarget(target);
  if (!normalized) return null;
  if (normalized === "Bull" || normalized === "25") {
    return "25";
  }
  const match = normalized.match(/^[SDT](\d{1,2})$/);
  if (!match) return null;
  return `S${Number(match[1])}`;
}

function preferredDoubleRank(route: CheckoutRoute, preferredDouble: PreferredDouble): number {
  if (preferredDouble === "Not sure") return 1;
  const last = route.route[route.route.length - 1];
  if (route.preferredDouble === preferredDouble || last === preferredDouble) return 0;
  return 1;
}

const AWKWARD_DOUBLE_TARGETS = new Set(["D15", "D13", "D11", "D9", "D7", "D5"]);
const EXPLICIT_ROUTE_PREFERENCES: Record<number, string> = {
  50: "Bull",
  61: "T15->D8",
  65: "T15->D10",
  67: "T17->D8",
  69: "T15->D12"
};

const PREFERRED_TWO_DART_FINISHES: Record<number, DartTarget[]> = {
  50: ["Bull"],
  80: ["T20", "D10"],
  81: ["T19", "D12"],
  87: ["T17", "D18"],
  100: ["T20", "D20"],
  101: ["T17", "Bull"],
  104: ["T18", "Bull"],
  107: ["T19", "Bull"],
  110: ["T20", "Bull"]
};

function routeKey(route: CheckoutRoute): string {
  return route.route.map((target) => normalizeDartTarget(target)).join("->");
}

function scoreRouteStrength(route: CheckoutRoute, preferredDouble: PreferredDouble): number {
  if (route.route.length === 0) return -999;

  const normalizedRoute = route.route.map((target) => normalizeDartTarget(target));
  const first = normalizedRoute[0] ?? "";
  const last = normalizedRoute[normalizedRoute.length - 1] ?? "";
  const continuation = route.singleHitContinuation;
  const continuationTargets = continuation?.continuationRoute ?? [];

  let score = 0;

  if (first.startsWith("T")) score += 4;
  if (normalizedRoute.length === 2) score += 2;
  if (last === "Bull") score += 1;

  if (preferredDouble !== "Not sure" && (route.preferredDouble === preferredDouble || last === preferredDouble)) {
    score += 3;
  }

  if (
    continuation &&
    continuation.remaining === 50 &&
    continuationTargets.length > 0 &&
    normalizeDartTarget(continuationTargets[0]) === "Bull"
  ) {
    score += 5;
  }

  if (AWKWARD_DOUBLE_TARGETS.has(last)) {
    score -= 3;
  }

  const explicit = EXPLICIT_ROUTE_PREFERENCES[route.finish];
  if (explicit && routeKey(route) === explicit) {
    score += 20;
  }

  return score;
}

function isValidFinalTarget(target: DartTarget): boolean {
  const normalized = normalizeDartTarget(target);
  if (!normalized) return false;
  return normalized === "Bull" || /^D([1-9]|1\d|20)$/.test(normalized);
}

function isValidTargetSequence(route: DartTarget[]): boolean {
  if (route.length < 1 || route.length > 3) return false;
  if (!route.every((target) => isValidDartTarget(target))) return false;
  return isValidFinalTarget(route[route.length - 1]);
}

function isValidTwoDartSequence(route: DartTarget[]): boolean {
  if (route.length < 1 || route.length > 2) return false;
  return isValidTargetSequence(route);
}

export function findTwoDartFinish(score: number): DartTarget[] | null {
  if (!Number.isInteger(score) || score < 2 || score > 110) {
    return null;
  }

  const preferred = PREFERRED_TWO_DART_FINISHES[score];
  if (preferred && isValidTwoDartSequence(preferred)) {
    const preferredTotal = preferred.reduce((sum, target) => sum + (scoreOfTarget(target) ?? 0), 0);
    if (preferredTotal === score) {
      return [...preferred];
    }
  }

  const bullFinish = score === 50 ? ["Bull"] : null;
  if (bullFinish) {
    return bullFinish;
  }

  const oneDartDouble = score % 2 === 0 ? `D${score / 2}` : null;
  if (oneDartDouble && isValidDartTarget(oneDartDouble)) {
    return [oneDartDouble];
  }

  const firstTargets = ["25", ...Array.from({ length: 20 }, (_, index) => `S${index + 1}`), ...Array.from({ length: 20 }, (_, index) => `D${index + 1}`), ...Array.from({ length: 20 }, (_, index) => `T${index + 1}`)];
  const finalTargets = ["Bull", ...Array.from({ length: 20 }, (_, index) => `D${index + 1}`)];

  let bestRoute: DartTarget[] | null = null;
  let bestScore = -Infinity;

  for (const finalTarget of finalTargets) {
    const finalValue = scoreOfTarget(finalTarget);
    if (finalValue === null || finalValue > score) continue;
    const remaining = score - finalValue;

    if (remaining === 0) {
      const route = [finalTarget];
      if (!isValidTwoDartSequence(route)) continue;
      const routeScore = finalTarget === "Bull" ? 200 : 100 + Number(finalTarget.slice(1));
      if (routeScore > bestScore) {
        bestRoute = route;
        bestScore = routeScore;
      }
      continue;
    }

    for (const firstTarget of firstTargets) {
      const firstValue = scoreOfTarget(firstTarget);
      if (firstValue === null || firstValue !== remaining) continue;
      const route = [firstTarget, finalTarget];
      if (!isValidTwoDartSequence(route)) continue;

      const normalizedFirst = normalizeDartTarget(firstTarget);
      const normalizedFinal = normalizeDartTarget(finalTarget);
      let routeScore = 0;
      if (normalizedFirst.startsWith("T")) routeScore += 100;
      else if (normalizedFirst.startsWith("S")) routeScore += 50;
      else if (normalizedFirst === "25") routeScore += 45;
      else routeScore += 30;

      if (normalizedFinal === "Bull") routeScore += 25;
      else routeScore += Number(normalizedFinal.slice(1));

      if (routeScore > bestScore) {
        bestRoute = route;
        bestScore = routeScore;
      }
    }
  }

  return bestRoute ? [...bestRoute] : null;
}

function deriveSingleHitContinuation(
  finish: number,
  route: DartTarget[],
  existing?: SingleHitContinuation
): SingleHitContinuation | undefined {
  if (route.length === 0) return undefined;
  if (existing) return existing;

  const first = normalizeDartTarget(route[0]);
  if (!first || !first.startsWith("T")) {
    return undefined;
  }
  const singleHitTarget = singleEquivalent(first);
  if (!singleHitTarget) return undefined;
  const singleScore = scoreOfTarget(singleHitTarget);
  if (singleScore === null) return undefined;
  const remaining = finish - singleScore;
  if (remaining <= 1 || remaining > 170) {
    return undefined;
  }
  const fallback = findTwoDartFinish(remaining);
  if (!fallback) {
    return {
      singleHitTarget,
      remaining,
      continuationRoute: [],
      note: "No two-dart finish available."
    };
  }
  return {
    singleHitTarget,
    remaining,
    continuationRoute: fallback
  };
}

function cloneRoute(route: CheckoutRoute): CheckoutRoute {
  return {
    ...route,
    route: [...route.route],
    singleHitContinuation: route.singleHitContinuation
      ? {
          ...route.singleHitContinuation,
          continuationRoute: [...route.singleHitContinuation.continuationRoute]
        }
      : undefined,
    alternativeRoutes: route.alternativeRoutes?.map((alternative) => ({
      ...alternative,
      route: [...alternative.route],
      singleHitContinuation: alternative.singleHitContinuation
        ? {
            ...alternative.singleHitContinuation,
            continuationRoute: [...alternative.singleHitContinuation.continuationRoute]
          }
        : undefined
    }))
  };
}

export function normalizeDartTarget(target: string): string {
  const token = target.trim().toUpperCase();
  if (!token) return "";
  if (token === "BULL" || token === "DBULL") return "Bull";
  if (token === "25" || token === "S25" || token === "SBULL") return "25";
  const plain = token.match(/^([1-9]|1\d|20)$/);
  if (plain) return `S${Number(plain[1])}`;
  const prefixed = token.match(/^([SDT])(\d{1,2})$/);
  if (!prefixed) return token;
  return `${prefixed[1]}${Number(prefixed[2])}`;
}

export function isValidDartTarget(target: string): boolean {
  const normalized = normalizeDartTarget(target);
  if (!normalized) return false;
  if (normalized === "25" || normalized === "Bull") return true;
  if (/^S([1-9]|1\d|20)$/.test(normalized)) return true;
  if (/^D([1-9]|1\d|20)$/.test(normalized)) return true;
  if (/^T([1-9]|1\d|20)$/.test(normalized)) return true;
  return false;
}

export function scoreOfTarget(target: string): number | null {
  const normalized = normalizeDartTarget(target);
  if (!isValidDartTarget(normalized)) return null;
  if (normalized === "Bull") return 50;
  if (normalized === "25") return 25;
  const matched = normalized.match(/^([SDT])(\d{1,2})$/);
  if (!matched) return null;
  const value = Number(matched[2]);
  if (matched[1] === "S") return value;
  if (matched[1] === "D") return value * 2;
  return value * 3;
}

export function validateCheckoutRoute(route: CheckoutRoute): boolean {
  if (route.finish < 2 || route.finish > 170) return false;
  if (route.isBogey) {
    return BOGEY_FINISHES.has(route.finish);
  }
  if (!isValidTargetSequence(route.route)) return false;
  const total = route.route.reduce((sum, target) => sum + (scoreOfTarget(target) ?? 0), 0);
  if (total !== route.finish) return false;

  const primaryContinuation = deriveSingleHitContinuation(
    route.finish,
    route.route,
    route.singleHitContinuation
  );
  if (primaryContinuation) {
    if (!isValidDartTarget(primaryContinuation.singleHitTarget)) return false;
    if (!primaryContinuation.continuationRoute.every((token) => isValidDartTarget(token))) return false;
    if (
      primaryContinuation.continuationRoute.length > 0 &&
      !isValidTwoDartSequence(primaryContinuation.continuationRoute)
    ) {
      return false;
    }
  }

  for (const alternative of route.alternativeRoutes ?? []) {
    if (!isValidTargetSequence(alternative.route)) return false;
    const alternativeTotal = alternative.route.reduce(
      (sum, token) => sum + (scoreOfTarget(token) ?? 0),
      0
    );
    if (alternativeTotal !== route.finish) return false;
    const continuation = deriveSingleHitContinuation(
      route.finish,
      alternative.route,
      alternative.singleHitContinuation
    );
    if (continuation) {
      if (!isValidDartTarget(continuation.singleHitTarget)) return false;
      if (!continuation.continuationRoute.every((token) => isValidDartTarget(token))) return false;
      if (continuation.continuationRoute.length > 0 && !isValidTwoDartSequence(continuation.continuationRoute)) {
        return false;
      }
    }
  }

  return true;
}

export function getCheckoutRoute(
  finish: number,
  preferredDouble: PreferredDouble = "Not sure"
): CheckoutRoute | null {
  return getPrimaryCheckoutRoute(finish, preferredDouble);
}

export function getCheckoutRoutes(
  finish: number,
  preferredDouble: PreferredDouble = "Not sure"
): CheckoutRoute[] {
  const base = CHECKOUT_ROUTES[finish];
  if (!base) return [];
  if (base.isBogey) return [cloneRoute(base)];
  if (!validateCheckoutRoute(base)) return [];

  const primary: CheckoutRoute = cloneRoute(base);
  primary.singleHitContinuation = deriveSingleHitContinuation(
    finish,
    primary.route,
    primary.singleHitContinuation
  );

  const alternatives = (base.alternativeRoutes ?? []).map((alternative) => {
    const singleHitContinuation = deriveSingleHitContinuation(
      finish,
      alternative.route,
      alternative.singleHitContinuation
    );
    const asRoute: CheckoutRoute = {
      finish,
      label: alternative.label,
      route: [...alternative.route],
      singleHitContinuation,
      preferredDouble: alternative.preferredDouble,
      note: alternative.note
    };
    return asRoute;
  });

  const combined = [primary, ...alternatives];
  combined.sort((a, b) => {
    const strengthDiff = scoreRouteStrength(b, preferredDouble) - scoreRouteStrength(a, preferredDouble);
    if (strengthDiff !== 0) return strengthDiff;
    return preferredDoubleRank(a, preferredDouble) - preferredDoubleRank(b, preferredDouble);
  });
  return combined;
}

export function getPrimaryCheckoutRoute(
  finish: number,
  preferredDouble: PreferredDouble = "Not sure"
): CheckoutRoute | null {
  const all = getCheckoutRoutes(finish, preferredDouble);
  if (all.length === 0) return null;
  return all[0];
}

export function getAlternativeCheckoutRoutes(
  finish: number,
  preferredDouble: PreferredDouble = "Not sure"
): CheckoutRouteAlternative[] {
  const routes = getCheckoutRoutes(finish, preferredDouble);
  if (routes.length <= 1) return [];
  return routes.slice(1).map((route) => ({
    label: route.label,
    route: route.route,
    singleHitContinuation: route.singleHitContinuation,
    note: route.note,
    preferredDouble: route.preferredDouble
  }));
}

export function getSingleHitContinuation(
  route: CheckoutRoute | CheckoutRouteAlternative
): SingleHitContinuation | undefined {
  return route.singleHitContinuation;
}

export function getBestFirstTarget(
  finish: number,
  preferredDouble: PreferredDouble = "Not sure"
): DartTarget | null {
  const route = getPrimaryCheckoutRoute(finish, preferredDouble);
  if (!route || route.isBogey || route.route.length === 0) return null;
  const first = normalizeDartTarget(route.route[0]);
  return isValidDartTarget(first) ? first : null;
}

function toRouteOption(route: CheckoutRoute): CheckoutRouteOption | null {
  if (route.route.length === 0) return null;
  const firstTarget = normalizeDartTarget(route.route[0]);
  if (!isValidDartTarget(firstTarget)) return null;
  const continuation = route.singleHitContinuation;
  return {
    label: route.label,
    route: route.route.map((token) => normalizeDartTarget(token)),
    firstTarget,
    singleHitTarget: continuation ? normalizeDartTarget(continuation.singleHitTarget) : undefined,
    remainingAfterSingle: continuation?.remaining ?? route.finish,
    followUpRoute: continuation?.continuationRoute.map((token) => normalizeDartTarget(token)),
    note: continuation?.note ?? route.note,
    preferredDouble: route.preferredDouble
  };
}

export function getCheckoutRouteDetails(
  finish: number,
  preferredDouble: PreferredDouble = "Not sure"
): CheckoutRouteDetails | null {
  const routes = getCheckoutRoutes(finish, preferredDouble);
  if (routes.length === 0) return null;
  if (routes[0].isBogey) {
    return {
      finish,
      routes: [],
      isBogey: true,
      note: routes[0].note
    };
  }
  const options = routes
    .map((route) => toRouteOption(route))
    .filter((route): route is CheckoutRouteOption => route !== null);
  if (options.length === 0) {
    return null;
  }
  return {
    finish,
    routes: options
  };
}

export function formatRoute(route: DartTarget[]): string {
  return route.map((token) => normalizeDartTarget(token)).join(" \u2192 ");
}

export function getLegacyRouteView(
  finish: number,
  preferredDouble: PreferredDouble = "Not sure"
): { finish: number; route: string; note: string; usedPreferredRoute: boolean } {
  const route = getPrimaryCheckoutRoute(finish, preferredDouble);
  if (!route || route.isBogey || route.route.length === 0) {
    return {
      finish,
      route: "No valid route yet.",
      note: BOGEY_FINISHES.has(finish)
        ? "Bogey number - cannot be finished in three darts."
        : "No detailed route yet.",
      usedPreferredRoute: false
    };
  }
  return {
    finish,
    route: formatRoute(route.route),
    note: route.note ?? "Use the route and adjust from the single-hit continuation if needed.",
    usedPreferredRoute: route.preferredDouble === preferredDouble
  };
}

for (const route of Object.values(CHECKOUT_ROUTES)) {
  if (!validateCheckoutRoute(route)) {
    console.warn("Invalid checkout route data ignored", route.finish, route);
  }
}

