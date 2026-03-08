import { Redirect } from "expo-router";
import { useAppContext } from "../context/AppContext";

export default function Index() {
  const { state } = useAppContext();

  if (state.role === "admin") {
    return <Redirect href="/(admin)" />;
  }

  if (state.user && state.profile && state.profile.onboarded === false) {
    return <Redirect href="/(onboarding)/setup" />;
  }

  if (state.user) {
    return <Redirect href="/(tabs)/Home" />;
  }

  return <Redirect href="/(auth)/Login" />;
}
