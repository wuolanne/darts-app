export type ThemeMode = "dark" | "light" | "dim" | "system";
export type AppLanguageMode = "en" | "fi" | "system";
export type PreferredDouble = "D16" | "D20" | "D18" | "D12" | "Not sure";
export type TimerOption = 0 | 10 | 20 | 30;
export type ThrowPaceMode = "not_set" | "manual" | "calibrated";

export interface ThrowPaceSetting {
  mode: ThrowPaceMode;
  secondsPerThree: number | null;
  updatedAt: string | null;
}

export interface UserSettings {
  preferredDouble: PreferredDouble;
  defaultTimer: TimerOption;
  themeMode: ThemeMode;
  languageMode: AppLanguageMode;
  vibrationFeedback: boolean;
  throwPace: ThrowPaceSetting;
}

export type CheckoutRangeKey =
  | "61-70"
  | "71-80"
  | "81-90"
  | "91-100"
  | "101-120"
  | "121-140"
  | "141-170"
  | "all"
  | "custom";

export interface CheckoutRangePreset {
  key: CheckoutRangeKey;
  label: string;
  min: number;
  max: number;
}

export type CheckoutResult = "finished" | "good_leave" | "failed" | "bust";

export interface CheckoutAttempt {
  id: string;
  timestamp: string;
  finishNumber: number;
  range: CheckoutRangeKey;
  preferredDouble: PreferredDouble;
  result: CheckoutResult;
  elapsedSeconds: number | null;
}

export type SpeedrunOrder = "sequential" | "random";
export type SpeedrunEntryResult = "finished" | "failed" | "bust";

export interface CheckoutSpeedrunEntry {
  checkout: number;
  seconds: number;
  result: SpeedrunEntryResult;
}

export interface CheckoutSpeedrunSession {
  id: string;
  timestamp: string;
  rangeLabel: string;
  rangeStart: number;
  rangeEnd: number;
  order: SpeedrunOrder;
  entries: CheckoutSpeedrunEntry[];
  totalActiveSeconds: number;
  pauseSeconds: number;
}

export type AroundClockMode =
  | "singles"
  | "doubles"
  | "trebles"
  | "full_sector"
  | "common_doubles"
  | "custom";

export interface AroundClockEntry {
  target: string;
  seconds: number;
}

export interface AroundClockSession {
  id: string;
  timestamp: string;
  mode: AroundClockMode;
  doubleRequirement: 1 | 2 | null;
  entries: AroundClockEntry[];
  totalActiveSeconds: number;
  pauseSeconds: number;
  estimatedDarts: number | null;
  throwPaceSecondsPerThree: number | null;
}

export type StatsRange = "7d" | "30d" | "total";

export type AppScreen =
  | "home"
  | "quick-checkout"
  | "speedrun"
  | "around-clock"
  | "checkout-library"
  | "stats"
  | "settings";
