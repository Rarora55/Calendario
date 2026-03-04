import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import AppLaunchScreen from '@/src/components/AppLaunchScreen';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'tabs',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
const APP_LAUNCH_SCREEN_MS = 1600;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!loaded) return;

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
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen name='day' options={{ title: "Día" }} />
        <Stack.Screen
          name="event-editor"
          options={{ title: "Crear Evento", presentation: "modal" }}
        />
        <Stack.Screen
          name="group-editor"
          options={{ title: "Crear Grupo", presentation: "modal" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
