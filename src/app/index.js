import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { theme } from "../constants/themes";
import { getStoredToken } from "../services/authService";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const token = await getStoredToken();
        if (mounted) {
          setIsAuthenticated(Boolean(token));
        }
      } catch (error) {
        if (__DEV__) {
          console.log("Auth bootstrap failed:", error?.message || error);
        }
        if (mounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={theme.colors.primaryPink} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/Home" />;
  }

  return <Redirect href="/(auth)/Login" />;
}
