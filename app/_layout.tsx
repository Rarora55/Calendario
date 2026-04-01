import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useMemo, useState } from "react";
import "react-native-reanimated";

import AppLaunchScreen from "@/src/components/AppLaunchScreen";
import { useAppTranslation } from "@/src/i18n/useAppTranslation";
import { useAppStore } from "@/src/state/store";
import { createNavigationTheme } from "@/src/theme/themes";
import { useAppTheme } from "@/src/theme/useAppTheme";

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
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (!loaded || hydrated) {
      return;
    }

    void hydrate();
  }, [hydrate, hydrated, loaded]);

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

  if (showLaunchScreen || !hydrated) {
    return <AppLaunchScreen />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { mode } = useAppTheme();
  const { copy } = useAppTranslation();
  const navigationTheme = useMemo(() => createNavigationTheme(mode), [mode]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack>
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen
          name="task-group-editor"
          options={{ title: copy.stack.taskGroup, presentation: "modal" }}
        />
        <Stack.Screen
          name="task-editor"
          options={{ title: copy.stack.task, presentation: "modal" }}
        />
        <Stack.Screen name="group-editor" options={{ title: copy.stack.taskGroup }} />
        <Stack.Screen name="event-editor" options={{ title: copy.stack.task }} />
      </Stack>
    </ThemeProvider>
  );
}
