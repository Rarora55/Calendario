import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, Tabs } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const inactiveIconColor = "#8A8F98";
  const activeIconColor = "#35291F";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeIconColor,
        tabBarInactiveTintColor: inactiveIconColor,
        headerShown: useClientOnlyValue(false, true),
        animation: "fade",
        headerStyle: {
          backgroundColor: "#FFF9F2",
        },
        headerTintColor: "#35291F",
        tabBarStyle: {
          backgroundColor: "#F4EDE4",
          borderTopColor: "#DFD2C4",
          height: 72,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "General",
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
          title: "Calendar",
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="priorities"
        options={{
          title: "Priority",
          tabBarIcon: ({ color }) => <TabBarIcon name="warning" color={color} />,
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: "Timer",
          tabBarIcon: ({ color }) => <TabBarIcon name="clock-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => <TabBarIcon name="pie-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
