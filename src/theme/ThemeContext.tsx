import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { ThemeMode } from "../types/models";
import { THEMES, ThemeTokens } from "./tokens";

interface ThemeContextValue {
  resolvedMode: "dark" | "light" | "dim";
  requestedMode: ThemeMode;
  tokens: ThemeTokens;
}

const ThemeContext = createContext<ThemeContextValue>({
  resolvedMode: "dark",
  requestedMode: "dark",
  tokens: THEMES.dark
});

function resolveMode(mode: ThemeMode, prefersDark: boolean): "dark" | "light" | "dim" {
  if (mode === "system") {
    return prefersDark ? "dark" : "light";
  }
  return mode;
}

export function ThemeProvider({
  requestedMode,
  children
}: PropsWithChildren<{ requestedMode: ThemeMode }>) {
  const [prefersDark, setPrefersDark] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return true;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const resolvedMode = resolveMode(requestedMode, prefersDark);
  const tokens = THEMES[resolvedMode];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg", tokens.background);
    root.style.setProperty("--surface", tokens.surface);
    root.style.setProperty("--surface-alt", tokens.surfaceAlt);
    root.style.setProperty("--text", tokens.text);
    root.style.setProperty("--text-muted", tokens.textMuted);
    root.style.setProperty("--accent", tokens.accent);
    root.style.setProperty("--accent-soft", tokens.accentSoft);
    root.style.setProperty("--success", tokens.success);
    root.style.setProperty("--warning", tokens.warning);
    root.style.setProperty("--danger", tokens.danger);
    root.style.setProperty("--border", tokens.border);
    root.style.colorScheme = resolvedMode === "light" ? "light" : "dark";
    document.body.style.background = tokens.background;
  }, [resolvedMode, tokens]);

  return (
    <ThemeContext.Provider value={{ resolvedMode, requestedMode, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
