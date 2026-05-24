import { readJson, writeJson } from "./localStorage";
import { AppLanguageMode, UserSettings } from "../types/models";

const SETTINGS_KEY = "settings";

export const DEFAULT_SETTINGS: UserSettings = {
  preferredDouble: "D16",
  defaultTimer: 0,
  themeMode: "dark",
  languageMode: "en",
  vibrationFeedback: false
};

export function readSettings(): UserSettings {
  const loaded = readJson<UserSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const languageMode = loaded.languageMode === "fi" ? "fi" : "en";
  return {
    ...DEFAULT_SETTINGS,
    ...loaded,
    languageMode: languageMode as AppLanguageMode
  };
}

export function writeSettings(settings: UserSettings): void {
  writeJson(SETTINGS_KEY, settings);
}
