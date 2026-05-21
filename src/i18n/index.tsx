import { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { AppLanguageMode } from "../types/models";
import { en, TranslationDict } from "./en";
import { fi } from "./fi";

type ResolvedLang = "en" | "fi";

interface I18nContextValue {
  requestedLanguage: AppLanguageMode;
  resolvedLanguage: ResolvedLang;
  t: TranslationDict;
}

const I18nContext = createContext<I18nContextValue>({
  requestedLanguage: "en",
  resolvedLanguage: "en",
  t: en
});

function resolveLanguage(mode: AppLanguageMode): ResolvedLang {
  if (mode === "en" || mode === "fi") return mode;
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("fi") ? "fi" : "en";
}

export function I18nProvider({
  requestedLanguage,
  children
}: PropsWithChildren<{ requestedLanguage: AppLanguageMode }>) {
  const resolvedLanguage = resolveLanguage(requestedLanguage);
  const t = resolvedLanguage === "fi" ? fi : en;

  const value = useMemo(
    () => ({ requestedLanguage, resolvedLanguage, t }),
    [requestedLanguage, resolvedLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function formatI18n(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((text, [key, value]) => {
    const token = `{${key}}`;
    return text.split(token).join(String(value));
  }, template);
}
