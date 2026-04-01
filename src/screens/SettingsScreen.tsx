import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";

import { useTabSwipeNavigation } from "@/src/hooks/useTabSwipeNavigation";
import { useAppTranslation } from "@/src/i18n/useAppTranslation";
import { useAppStore } from "@/src/state/store";
import { useAppTheme } from "@/src/theme/useAppTheme";

export default function SettingsScreen() {
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const preferences = useAppStore((state) => state.preferences);
  const savePreferences = useAppStore((state) => state.savePreferences);
  const { colors } = useAppTheme();
  const { copy } = useAppTranslation();
  const panHandlers = useTabSwipeNavigation();

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  return (
    <View {...panHandlers} style={{ flex: 1, backgroundColor: colors.background, padding: 18, gap: 18 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>{copy.settings.title}</Text>
        <Text style={{ color: colors.textMuted }}>{copy.settings.description}</Text>
      </View>

      <View style={{ gap: 10, backgroundColor: colors.card, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.text, fontWeight: "700" }}>{copy.settings.theme}</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {(["system", "light", "dark"] as const).map((theme) => (
            <Pressable
              key={theme}
              onPress={() => void savePreferences({ theme })}
              style={{
                flex: 1,
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: "center",
                backgroundColor: preferences?.theme === theme ? colors.primary : colors.surfaceMuted,
              }}
            >
              <Text style={{ color: preferences?.theme === theme ? "#ffffff" : colors.text, fontWeight: "700" }}>
                {copy.settings.themeOptions[theme]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ gap: 10, backgroundColor: colors.card, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.text, fontWeight: "700" }}>{copy.settings.language}</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {(["en", "es"] as const).map((language) => (
            <Pressable
              key={language}
              onPress={() => void savePreferences({ language })}
              style={{
                flex: 1,
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: "center",
                backgroundColor: preferences?.language === language ? colors.text : colors.surfaceMuted,
              }}
            >
              <Text style={{ color: preferences?.language === language ? colors.background : colors.text, fontWeight: "700" }}>
                {copy.settings.languageOptions[language]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
