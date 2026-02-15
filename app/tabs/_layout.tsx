import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: useClientOnlyValue(false, true),
        animation: "fade",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "General",
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerRight: () => (
            <Link href="/event-editor" asChild>
              <Pressable style={{ paddingHorizontal: 12 }}>
                {({ pressed }) => (
                  <FontAwesome
                    name="plus"
                    size={22}
                    color={Colors[colorScheme ?? "light"].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="calendars"
        options={{
          title: "Calendario",
          tabBarIcon: () => (
            <TabBarIcon
              name="calendar-o"
              color={colorScheme === "dark" ? "#ffffff" : "#111111"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="priorities"
        options={{
          title: "Prioridades",
          tabBarIcon: ({ color }) => <TabBarIcon name="circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="bin"
        options={{
          title: "Bin",
          tabBarIcon: ({ color }) => <TabBarIcon name="trash" color={color} />,
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
