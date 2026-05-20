import { Redirect, Stack } from "expo-router";
import { useAppContext } from "../../context/AppContext";
import { getAuthenticatedHref } from "../../utils/authRedirect";
import SplashScreen from "../../components/common/SplashScreen";

export default function AuthLayout() {
  const { state } = useAppContext();

  if (state.isLoading) {
    return <SplashScreen />;
  }

  if (state.user) {
    return (
      <Redirect
        href={getAuthenticatedHref({
          role: state.role,
          onboarded: state.profile?.onboarded,
        })}
      />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" />
      <Stack.Screen name="Signup" />
      <Stack.Screen name="VerifyAge" />
      <Stack.Screen name="ForgotPassword" />
    </Stack>
  );
}
