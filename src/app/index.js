import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { theme } from "../constants/themes";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { isBootstrapping, isAuthenticated, role } = useAuth();

  if (isBootstrapping) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={theme.colors.primaryPink} />
      </View>
    );
  }

  if (isAuthenticated) {
    if (role === "admin") {
      return <Redirect href="/(admin)/Dashboard" />;
    }
    return <Redirect href="/(tabs)/Home" />;
  }

  return <Redirect href="/(auth)/Login" />;
}
