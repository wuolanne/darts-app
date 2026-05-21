import { CheckoutRangePreset, TimerOption } from "../types/models";

export const CHECKOUT_BOGEY_NUMBERS = [169, 168, 166, 165, 163, 162, 159] as const;
const BOGEY_SET = new Set<number>(CHECKOUT_BOGEY_NUMBERS);

export const CHECKOUT_RANGE_PRESETS: CheckoutRangePreset[] = [
  { key: "61-70", label: "61-70", min: 61, max: 70 },
  { key: "71-80", label: "71-80", min: 71, max: 80 },
  { key: "81-90", label: "81-90", min: 81, max: 90 },
  { key: "91-100", label: "91-100", min: 91, max: 100 },
  { key: "101-120", label: "101-120", min: 101, max: 120 },
  { key: "121-140", label: "121-140", min: 121, max: 140 },
  { key: "141-170", label: "141-170", min: 141, max: 170 },
  { key: "all", label: "All", min: 61, max: 170 },
  { key: "custom", label: "Custom", min: 61, max: 170 }
];

export const TIMER_OPTIONS: TimerOption[] = [0, 10, 20, 30];

export function normalizeCheckoutRangeKey(value: string | null | undefined): CheckoutRangePreset["key"] {
  const found = CHECKOUT_RANGE_PRESETS.find((preset) => preset.key === value);
  return found ? found.key : "61-70";
}

export function isBogeyCheckout(finish: number): boolean {
  return BOGEY_SET.has(finish);
}

export function isCheckoutInRangeBounds(finish: number): boolean {
  return finish >= 61 && finish <= 170 && !isBogeyCheckout(finish);
}

export function sanitizeCheckoutCustomRange(from: number, to: number): { min: number; max: number } | null {
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  const min = Math.floor(from);
  const max = Math.floor(to);
  if (min < 61 || max > 170 || min > max) return null;
  return { min, max };
}

export function listPlayableCheckoutNumbers(
  min: number,
  max: number,
  isAllowed?: (finish: number) => boolean
): number[] {
  const values: number[] = [];
  for (let finish = min; finish <= max; finish += 1) {
    if (!isCheckoutInRangeBounds(finish)) continue;
    if (isAllowed && !isAllowed(finish)) continue;
    values.push(finish);
  }
  return values;
}
