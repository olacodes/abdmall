import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_700Bold,
} from "@expo-google-fonts/hanken-grotesk";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Keys must match the fontFamily names in tailwind.config.js.
  const [loaded] = useFonts({
    Fraunces: Fraunces_600SemiBold,
    HankenGrotesk: HankenGrotesk_400Regular,
    "HankenGrotesk-Medium": HankenGrotesk_500Medium,
    "HankenGrotesk-Bold": HankenGrotesk_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
