import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Lora_400Regular,
  Lora_700Bold,
} from "@expo-google-fonts/lora";
import SplashScreen from "../components/common/SplashScreen";
import { AppProvider } from "../context/AppContext";
import { ToastProvider } from "../context/ToastContext";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    Lora_700Bold,
  });

  if (!fontsLoaded) {
    return <SplashScreen />;
  }

  return (
    <AppProvider>
      <ToastProvider>
        <>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="profile/[userId]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </>
      </ToastProvider>
    </AppProvider>
  );
}
