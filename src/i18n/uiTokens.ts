export type SupportedUiLanguage = "en" | "fi";

export interface HomeDashboardCopy {
  dayStreak: string;
  practiceTime: string;
  bestFinish: string;
  bestRange: string;
  bestAtc: string;
  checkoutLabel: string;
  totalLabel: string;
}

export interface SettingsLanguageCopy {
  english: string;
  finnish: string;
}

export function getHomeDashboardCopy(language: SupportedUiLanguage): HomeDashboardCopy {
  if (language === "fi") {
    return {
      dayStreak: "PÄIVÄN PUTKI",
      practiceTime: "TREENIAIKA",
      bestFinish: "PARAS FINISH",
      bestRange: "PARAS SARJA",
      bestAtc: "PARAS ATC",
      checkoutLabel: "checkout",
      totalLabel: "yhteensä"
    };
  }

  return {
    dayStreak: "DAY STREAK",
    practiceTime: "PRACTICE TIME",
    bestFinish: "BEST FINISH",
    bestRange: "BEST RANGE",
    bestAtc: "BEST ATC",
    checkoutLabel: "checkout",
    totalLabel: "total"
  };
}

export function getSettingsLanguageCopy(language: SupportedUiLanguage): SettingsLanguageCopy {
  if (language === "fi") {
    return {
      english: "Englanti",
      finnish: "Suomi"
    };
  }

  return {
    english: "English",
    finnish: "Finnish"
  };
}
