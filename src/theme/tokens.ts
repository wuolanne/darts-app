export interface ThemeTokens {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
  border: string;
}

export const THEMES: Record<"dark" | "light" | "dim", ThemeTokens> = {
  dark: {
    background: "#0a0b0d",
    surface: "#14171c",
    surfaceAlt: "#1b1f26",
    text: "#f3f5f7",
    textMuted: "#98a0ab",
    accent: "#b6ff2f",
    accentSoft: "#2a3a0a",
    success: "#8df01c",
    warning: "#ffbe45",
    danger: "#ff5f5f",
    border: "#2d333d"
  },
  light: {
    background: "#f1f3f6",
    surface: "#ffffff",
    surfaceAlt: "#e8ecf2",
    text: "#12161b",
    textMuted: "#5d6671",
    accent: "#6cae00",
    accentSoft: "#d7e8b4",
    success: "#5e9d00",
    warning: "#c57d00",
    danger: "#c83434",
    border: "#cfd6df"
  },
  dim: {
    background: "#0f1217",
    surface: "#1a1f27",
    surfaceAlt: "#232a34",
    text: "#eef1f4",
    textMuted: "#98a3b2",
    accent: "#9eea22",
    accentSoft: "#2e3f10",
    success: "#84dd1f",
    warning: "#f7bf57",
    danger: "#f06b6b",
    border: "#3a424e"
  }
};
