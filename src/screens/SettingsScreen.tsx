import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppStore } from "@/src/state/store";

export default function SettingsScreen() {
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const preferences = useAppStore((state) => state.preferences);
  const savePreferences = useAppStore((state) => state.savePreferences);

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
    }
  }, [hydrate, hydrated]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff9f2", padding: 18, gap: 18 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#35291f" }}>Settings</Text>
        <Text style={{ color: "#6c5a4c" }}>
          Preference persistence is wired to SQLite now. Full auth and sync controls will layer on top of this.
        </Text>
      </View>

      <View style={{ gap: 10, backgroundColor: "#ffffff", borderRadius: 24, padding: 18, borderWidth: 1, borderColor: "#dfd2c4" }}>
        <Text style={{ color: "#35291f", fontWeight: "700" }}>Theme</Text>
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
                backgroundColor: preferences?.theme === theme ? "#de8f6e" : "#f4ede4",
              }}
            >
              <Text style={{ color: preferences?.theme === theme ? "#ffffff" : "#35291f", fontWeight: "700" }}>
                {theme}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ gap: 10, backgroundColor: "#ffffff", borderRadius: 24, padding: 18, borderWidth: 1, borderColor: "#dfd2c4" }}>
        <Text style={{ color: "#35291f", fontWeight: "700" }}>Language</Text>
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
                backgroundColor: preferences?.language === language ? "#35291f" : "#f4ede4",
              }}
            >
              <Text style={{ color: preferences?.language === language ? "#fff9f2" : "#35291f", fontWeight: "700" }}>
                {language.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
