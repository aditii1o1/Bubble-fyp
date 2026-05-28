import { Redirect } from "expo-router";
import { useAppContext } from "../context/AppContext";
import { getAuthenticatedHref } from "../utils/authRedirect";
import SplashScreen from "../components/common/SplashScreen";

export default function Index() {
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

  return <Redirect href="/(auth)/Login" />;
}
