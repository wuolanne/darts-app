import { CheckoutRangePreset, TimerOption } from "../types/models";

export const CHECKOUT_RANGE_PRESETS: CheckoutRangePreset[] = [
  { key: "41-60", label: "41-60", min: 41, max: 60 },
  { key: "61-80", label: "61-80", min: 61, max: 80 },
  { key: "81-100", label: "81-100", min: 81, max: 100 },
  { key: "101-130", label: "101-130", min: 101, max: 130 },
  { key: "131-170", label: "131-170", min: 131, max: 170 }
];

export const TIMER_OPTIONS: TimerOption[] = [0, 10, 20, 30];
