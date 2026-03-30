import { useColorScheme } from "react-native";

import { DEFAULT_THEME } from "@/src/features/shared/types";
import { useAppStore } from "@/src/state/store";
import { resolveThemeMode } from "@/src/theme/resolveTheme";
import { themeTokens } from "@/src/theme/tokens";

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const preference = useAppStore((state) => state.preferences?.theme ?? DEFAULT_THEME);
  const mode = resolveThemeMode(preference, systemColorScheme);

  return {
    colors: themeTokens[mode],
    isDark: mode === "dark",
    mode,
    preference,
  };
}
