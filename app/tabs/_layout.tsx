import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, Tabs } from "expo-router";
import React from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useAppTranslation } from "@/src/i18n/useAppTranslation";
import { useAppTheme } from "@/src/theme/useAppTheme";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { copy } = useAppTranslation();
  const insets = useSafeAreaInsets();
  const inactiveIconColor = colors.textMuted;
  const activeIconColor = colors.text;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeIconColor,
        tabBarInactiveTintColor: inactiveIconColor,
        headerShown: useClientOnlyValue(false, true),
        animation: "fade",
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.surfaceMuted,
          borderTopColor: colors.border,
          height: 82 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 12),
        },
        tabBarItemStyle: {
          paddingVertical: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: copy.tabs.general,
          tabBarIcon: ({ color }) => <TabBarIcon name="th-large" color={color} />,
          headerRight: () => (
            <Pressable style={{ paddingHorizontal: 12 }} onPress={() => router.push("/task-group-editor" as never)}>
              {({ pressed }) => (
                <FontAwesome
                  name="plus"
                  size={22}
                  color={activeIconColor}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="calendars"
        options={{
          title: copy.tabs.calendar,
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="priorities"
        options={{
          title: copy.tabs.priority,
          tabBarIcon: ({ color }) => <TabBarIcon name="warning" color={color} />,
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: copy.tabs.timer,
          tabBarIcon: ({ color }) => <TabBarIcon name="clock-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: copy.tabs.reports,
          tabBarIcon: ({ color }) => <TabBarIcon name="pie-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: copy.tabs.settings,
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
