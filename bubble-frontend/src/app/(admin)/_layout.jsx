import { Stack } from "expo-router";
import { Redirect } from "expo-router";
import { useAppContext } from "../../context/AppContext";

export default function AdminLayout() {
  const { state } = useAppContext();

  if (state.role !== "admin") {
    return <Redirect href="/(auth)/Login" />;
  }

  if (state.profile?.onboarded === false) {
    return <Redirect href="/(onboarding)/setup" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Reports" />
      <Stack.Screen name="reports/Resolved" />
      <Stack.Screen name="ReportDetail" />
      <Stack.Screen name="Users" />
      <Stack.Screen name="Settings" />
      <Stack.Screen name="Moderation" />
      <Stack.Screen name="Notifications" />
    </Stack>
  );
}
