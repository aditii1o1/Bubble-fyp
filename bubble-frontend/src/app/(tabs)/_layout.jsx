import { Redirect, Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";
import { View } from "react-native";
import { useAppContext } from "../../context/AppContext";

export default function TabLayout() {
  const { state } = useAppContext();

  if (state.role === "admin") {
    return <Redirect href="/(admin)" />;
  }

  if (!state.user) {
    return <Redirect href="/(auth)/Login" />;
  }

  if (state.profile?.onboarded === false) {
    return <Redirect href="/(onboarding)/setup" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primaryPink,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.bgWhite,
          borderTopWidth: 1,
          borderTopColor: theme.colors.borderLight,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: theme.fontFamily.regular,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Create"
        options={{
          title: "", // No title
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                backgroundColor: theme.colors.primaryPink,
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                elevation: 4,
                shadowColor: theme.colors.primaryPink,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
            >
              <MaterialIcons
                name="add"
                size={26}
                color={theme.colors.bgWhite}
              />
            </View>
          ),
          tabBarLabel: "", // Hide label completely
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
