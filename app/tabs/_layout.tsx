import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, Tabs } from "expo-router";
import React from "react";
import { Alert, Pressable } from "react-native";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const inactiveIconColor = "#8A8F98";
  const activeIconColor = "#FFFFFF";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeIconColor,
        tabBarInactiveTintColor: inactiveIconColor,
        headerShown: useClientOnlyValue(false, true),
        animation: "fade",
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#111111" : "#1B1D22",
          borderTopColor: "transparent",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "General",
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerRight: () => (
            <Pressable
              style={{ paddingHorizontal: 12 }}
              onPress={() =>
                Alert.alert("Crear", "Selecciona el tipo:", [
                  {
                    text: "Crear grupo",
                    onPress: () => router.push("/group-editor" as never),
                  },
                  {
                    text: "Crear evento",
                    onPress: () => router.push("/event-editor" as never),
                  },
                  {
                    text: "Cancelar",
                    style: "cancel",
                  },
                ])
              }
            >
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
          title: "Calendario",
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar-o" color={color} />,
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
