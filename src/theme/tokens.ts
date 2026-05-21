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
    background: "#07111e",
    surface: "#0f1f35",
    surfaceAlt: "#102845",
    text: "#f2f7ff",
    textMuted: "#9db0cc",
    accent: "#30d6ff",
    accentSoft: "#173d5a",
    success: "#37d67a",
    warning: "#ffbf47",
    danger: "#ff6475",
    border: "#1f3a5c"
  },
  light: {
    background: "#edf4ff",
    surface: "#ffffff",
    surfaceAlt: "#dbe8ff",
    text: "#102035",
    textMuted: "#55637b",
    accent: "#0b7fff",
    accentSoft: "#c9e2ff",
    success: "#1fa85f",
    warning: "#ce8200",
    danger: "#cc3043",
    border: "#c3d1e7"
  },
  dim: {
    background: "#10141d",
    surface: "#1a2030",
    surfaceAlt: "#212b3f",
    text: "#ecf0f8",
    textMuted: "#99a6bf",
    accent: "#4dc8ff",
    accentSoft: "#243756",
    success: "#42c97d",
    warning: "#ffca5d",
    danger: "#ff7785",
    border: "#33445f"
  }
};
