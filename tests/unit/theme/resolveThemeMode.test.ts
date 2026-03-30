import { describe, expect, it } from "@jest/globals";

import { resolveThemeMode } from "@/src/theme/resolveTheme";

describe("resolveThemeMode", () => {
  it("returns explicit light and dark preferences unchanged", () => {
    expect(resolveThemeMode("light", "dark")).toBe("light");
    expect(resolveThemeMode("dark", "light")).toBe("dark");
  });

  it("uses the system appearance when preference is system", () => {
    expect(resolveThemeMode("system", "dark")).toBe("dark");
    expect(resolveThemeMode("system", "light")).toBe("light");
  });

  it("falls back to light when system appearance is unavailable", () => {
    expect(resolveThemeMode("system", null)).toBe("light");
    expect(resolveThemeMode(undefined, null)).toBe("light");
  });
});
