import type { ColorSchemeName } from "react-native";

import type { ThemePreference } from "@/src/features/shared/types";

export function resolveThemeMode(
  preference: ThemePreference | null | undefined,
  systemColorScheme: ColorSchemeName,
): "light" | "dark" {
  if (preference === "light" || preference === "dark") {
    return preference;
  }

  return systemColorScheme === "dark" ? "dark" : "light";
}
