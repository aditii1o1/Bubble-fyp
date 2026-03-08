import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/themes";
import { styles } from "./NotificationsPanel.styles";

export default function NotificationsEmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name="notifications-outline"
          size={48}
          color={theme.colors.primaryPink + "50"}
        />
      </View>
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubtext}>
        When you get notifications, they will appear here
      </Text>
    </View>
  );
}

