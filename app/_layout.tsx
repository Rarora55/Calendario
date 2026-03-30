import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useMemo, useState } from "react";
import "react-native-reanimated";

import AppLaunchScreen from "@/src/components/AppLaunchScreen";
import { createNavigationTheme } from "@/src/theme/themes";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "tabs",
};

SplashScreen.preventAutoHideAsync();
const APP_LAUNCH_SCREEN_MS = 1600;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    void SplashScreen.hideAsync();
    const timeoutId = setTimeout(() => {
      setShowLaunchScreen(false);
    }, APP_LAUNCH_SCREEN_MS);

    return () => clearTimeout(timeoutId);
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (showLaunchScreen) {
    return <AppLaunchScreen />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const [mode] = useState<"light" | "dark">("light");
  const navigationTheme = useMemo(() => createNavigationTheme(mode), [mode]);

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen
          name="task-group-editor"
          options={{ title: "Task Group", presentation: "modal" }}
        />
        <Stack.Screen
          name="task-editor"
          options={{ title: "Task", presentation: "modal" }}
        />
        <Stack.Screen name="group-editor" options={{ title: "Task Group" }} />
        <Stack.Screen name="event-editor" options={{ title: "Task" }} />
      </Stack>
    </ThemeProvider>
  );
}
