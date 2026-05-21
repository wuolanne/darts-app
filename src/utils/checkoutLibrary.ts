import { PreferredDouble } from "../types/models";

type DartKind = "S" | "D" | "T" | "SB" | "DB";

interface DartThrow {
  label: string;
  score: number;
  kind: DartKind;
}

export interface CheckoutOption {
  route: string[];
  dartsUsed: 1 | 2 | 3;
  endsOnPreferred: boolean;
}

export type CheckoutRouteOption = {
  label: string;
  route: string[];
  firstTarget: string;
  singleHitScore: number;
  remainingAfterSingle: number;
  followUpRoute: string[];
  note?: string;
  preferredDouble?: string;
};

export type CheckoutRouteDetails = {
  finish: number;
  routes: CheckoutRouteOption[];
};

const THROWS: DartThrow[] = [
  ...Array.from({ length: 20 }, (_, i) => ({ label: `S${i + 1}`, score: i + 1, kind: "S" as const })),
  ...Array.from({ length: 20 }, (_, i) => ({ label: `D${i + 1}`, score: (i + 1) * 2, kind: "D" as const })),
  ...Array.from({ length: 20 }, (_, i) => ({ label: `T${i + 1}`, score: (i + 1) * 3, kind: "T" as const })),
  { label: "25", score: 25, kind: "SB" },
  { label: "Bull", score: 50, kind: "DB" }
];

const FINAL_DARTS: DartThrow[] = [
  ...Array.from({ length: 20 }, (_, i) => ({ label: `D${i + 1}`, score: (i + 1) * 2, kind: "D" as const })),
  { label: "Bull", score: 50, kind: "DB" }
];

const CACHE = new Map<number, CheckoutOption[]>();

function isBogey(finish: number): boolean {
  return [159, 162, 163, 165, 166, 168, 169].includes(finish);
}

function compareRoutes(a: CheckoutOption, b: CheckoutOption): number {
  if (a.endsOnPreferred !== b.endsOnPreferred) {
    return a.endsOnPreferred ? -1 : 1;
  }
  if (a.dartsUsed !== b.dartsUsed) {
    return a.dartsUsed - b.dartsUsed;
  }
  return a.route.join("-").localeCompare(b.route.join("-"));
}

function uniqueSort(options: CheckoutOption[]): CheckoutOption[] {
  const seen = new Set<string>();
  const next: CheckoutOption[] = [];
  for (const option of options) {
    const key = option.route.join("|");
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    next.push(option);
  }
  return next.sort(compareRoutes);
}

function singleEquivalentScore(token: string): number | null {
  const treble = token.match(/^T(\d{1,2})$/);
  if (treble) return Number(treble[1]);
  const double = token.match(/^D(\d{1,2})$/);
  if (double) return Number(double[1]);
  const single = token.match(/^S(\d{1,2})$/);
  if (single) return Number(single[1]);
  const plain = token.match(/^(\d{1,2})$/);
  if (plain) return Number(plain[1]);
  if (token === "Bull") return 25;
  if (token === "25") return 25;
  return null;
}

function isPreferredDoubleRoute(option: CheckoutOption, preferredDouble: PreferredDouble): boolean {
  return preferredDouble !== "Not sure" && option.route[option.route.length - 1] === preferredDouble;
}

function pickBestFinishOption(
  finish: number,
  preferredDouble: PreferredDouble
): CheckoutOption | null {
  const next = getCheckoutOptions(finish, preferredDouble).options;
  const twoPreferred = next.find((item) => item.dartsUsed === 2 && isPreferredDoubleRoute(item, preferredDouble));
  if (twoPreferred) return twoPreferred;
  const twoAny = next.find((item) => item.dartsUsed === 2);
  if (twoAny) return twoAny;
  const anyPreferred = next.find((item) => isPreferredDoubleRoute(item, preferredDouble));
  if (anyPreferred) return anyPreferred;
  return next[0] ?? null;
}

function buildRouteOption(
  finish: number,
  option: CheckoutOption,
  preferredDouble: PreferredDouble,
  label: string
): CheckoutRouteOption {
  const firstTarget = option.route[0];
  const singleHitScore = singleEquivalentScore(firstTarget) ?? 0;
  const remainingAfterSingle = Math.max(0, finish - singleHitScore);

  const followUpBest = remainingAfterSingle > 1 ? pickBestFinishOption(remainingAfterSingle, preferredDouble) : null;
  const followUpRoute = followUpBest?.route ?? [];
  const preferredDoubleValue =
    preferredDouble !== "Not sure" && option.route[option.route.length - 1] === preferredDouble
      ? preferredDouble
      : undefined;

  return {
    label,
    route: option.route,
    firstTarget,
    singleHitScore,
    remainingAfterSingle,
    followUpRoute,
    preferredDouble: preferredDoubleValue,
    note:
      followUpRoute.length === 0
        ? "No detailed follow-up yet."
        : undefined
  };
}

function routeEquals(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((item, idx) => item === b[idx]);
}

const DETAIL_OVERRIDES: Record<number, string[][]> = {
  81: [["T19", "D12"], ["T15", "D18"]],
  87: [["T17", "D18"], ["T19", "D15"]]
};

export function getCheckoutRouteDetails(
  finish: number,
  preferredDouble: PreferredDouble
): CheckoutRouteDetails | null {
  const { options } = getCheckoutOptions(finish, preferredDouble);
  if (options.length === 0) {
    return null;
  }

  const twoDart = options.filter((item) => item.dartsUsed === 2);
  const pool = twoDart.length > 0 ? twoDart : options;

  const picked: CheckoutOption[] = [];
  const overrides = DETAIL_OVERRIDES[finish];
  if (overrides) {
    for (const route of overrides) {
      const found = pool.find((item) => routeEquals(item.route, route));
      if (found) {
        picked.push(found);
      }
    }
  }

  const preferred = pool.find((item) => isPreferredDoubleRoute(item, preferredDouble));
  if (preferred && !picked.includes(preferred)) {
    picked.unshift(preferred);
  }

  const optimal = pool[0];
  if (optimal && !picked.includes(optimal)) {
    picked.push(optimal);
  }

  const alt = pool.find((item) => !picked.includes(item));
  if (alt) {
    picked.push(alt);
  }

  const routes = picked.slice(0, 3).map((item, idx) =>
    buildRouteOption(
      finish,
      item,
      preferredDouble,
      idx === 0 && isPreferredDoubleRoute(item, preferredDouble)
        ? "Preferred route"
        : idx === 0
          ? "Optimal route"
          : "Alternative route"
    )
  );

  if (routes.length === 0) {
    return null;
  }

  return { finish, routes };
}

export function getCheckoutOptions(
  finish: number,
  preferredDouble: PreferredDouble
): { options: CheckoutOption[]; isCheckoutPossible: boolean } {
  if (finish < 2 || finish > 170 || isBogey(finish)) {
    return { options: [], isCheckoutPossible: false };
  }
  if (CACHE.has(finish)) {
    const cached = CACHE.get(finish)!;
    return {
      options: cached.map((option) => ({
        ...option,
        endsOnPreferred:
          preferredDouble !== "Not sure" &&
          option.route[option.route.length - 1] === preferredDouble
      })),
      isCheckoutPossible: cached.length > 0
    };
  }

  const raw: CheckoutOption[] = [];

  for (const last of FINAL_DARTS) {
    if (last.score === finish) {
      raw.push({ route: [last.label], dartsUsed: 1, endsOnPreferred: false });
    }
  }

  for (const first of THROWS) {
    for (const last of FINAL_DARTS) {
      if (first.score + last.score === finish) {
        raw.push({ route: [first.label, last.label], dartsUsed: 2, endsOnPreferred: false });
      }
    }
  }

  for (const first of THROWS) {
    for (const second of THROWS) {
      const partial = first.score + second.score;
      if (partial >= finish) {
        continue;
      }
      for (const last of FINAL_DARTS) {
        if (partial + last.score === finish) {
          raw.push({
            route: [first.label, second.label, last.label],
            dartsUsed: 3,
            endsOnPreferred: false
          });
        }
      }
    }
  }

  const sorted = uniqueSort(raw);
  CACHE.set(finish, sorted);

  return {
    options: sorted.map((option) => ({
      ...option,
      endsOnPreferred:
        preferredDouble !== "Not sure" &&
        option.route[option.route.length - 1] === preferredDouble
    })),
    isCheckoutPossible: sorted.length > 0
  };
}
