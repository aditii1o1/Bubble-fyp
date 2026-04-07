import { Redirect } from "expo-router";
import { useAppContext } from "../context/AppContext";
import { getAuthenticatedHref } from "../utils/authRedirect";

export default function Index() {
  const { state } = useAppContext();

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
