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
