import { readJson, writeJson } from "./localStorage";
import { UserSettings } from "../types/models";

const SETTINGS_KEY = "settings";

export const DEFAULT_SETTINGS: UserSettings = {
  preferredDouble: "D16",
  defaultTimer: 0,
  themeMode: "dark",
  throwPace: {
    mode: "not_set",
    secondsPerThree: null,
    updatedAt: null
  }
};

export function readSettings(): UserSettings {
  const loaded = readJson<UserSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  return {
    ...DEFAULT_SETTINGS,
    ...loaded,
    throwPace: {
      ...DEFAULT_SETTINGS.throwPace,
      ...loaded.throwPace
    }
  };
}

export function writeSettings(settings: UserSettings): void {
  writeJson(SETTINGS_KEY, settings);
}
