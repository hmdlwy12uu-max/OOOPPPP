import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { LogBox, View } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { MiniPlayer } from "@/src/components/MiniPlayer";
import { ReminderSync } from "@/src/components/ReminderSync";
import "@/src/backgroundSync";
import { queryClient } from "@/src/query-client";
import { SettingsProvider } from "@/src/settings";
import { colors as splashColors, ThemeProvider, useTheme } from "@/src/theme";
import { ToastHost } from "@/src/toast";

LogBox.ignoreAllLogs(true);
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Amiri: require("../assets/fonts/Amiri-Regular.ttf"),
    "Amiri-Bold": require("../assets/fonts/Amiri-Bold.ttf"),
    AmiriQuran: require("../assets/fonts/AmiriQuran-Regular.ttf"),
    ArefRuqaa: require("../assets/fonts/ArefRuqaa-Bold.ttf"),
    Tajawal: require("../assets/fonts/Tajawal-Regular.ttf"),
    "Tajawal-Medium": require("../assets/fonts/Tajawal-Medium.ttf"),
    "Tajawal-Bold": require("../assets/fonts/Tajawal-Bold.ttf"),
    Feather: require("@react-native-vector-icons/feather/fonts/Feather.ttf"),
  });
  const ready = loaded || !!error;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: splashColors.surface }} />;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SettingsProvider>
            <KeyboardProvider>
              <ThemedApp />
            </KeyboardProvider>
          </SettingsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function ThemedApp() {
  const { scheme, colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <ReminderSync />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }} />
      <MiniPlayer />
      <ToastHost />
    </View>
  );
}
