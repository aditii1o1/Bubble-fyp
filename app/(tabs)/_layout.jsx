// app/(tabs)/_layout.jsx
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons"; // Add this import
import { theme } from "../../src/constants/themes";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          tabBarIcon: (
            { color, size } // Fixed: Use function not string
          ) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      {/* Add more tabs as needed */}
    </Tabs>
  );
}
