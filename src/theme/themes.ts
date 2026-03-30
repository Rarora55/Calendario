import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";

import { themeTokens } from "@/src/theme/tokens";

export function createNavigationTheme(mode: "light" | "dark"): Theme {
  const tokens = themeTokens[mode];
  const base = mode === "dark" ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: tokens.primary,
      background: tokens.background,
      card: tokens.card,
      text: tokens.text,
      border: tokens.border,
      notification: tokens.accent,
    },
  };
}
