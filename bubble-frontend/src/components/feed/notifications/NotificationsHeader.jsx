import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/themes";
import { styles } from "./NotificationsPanel.styles";

export default function NotificationsHeader({
  unreadCount = 0,
  onClose,
  onMarkAllRead,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={24} color={theme.colors.primaryPink} />
        </TouchableOpacity>
      </View>

      <View style={styles.headerContent}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 ? (
          <View style={styles.subtitleContainer}>
            <View style={styles.subtitleDot} />
            <Text style={styles.subtitle}>
              {unreadCount} new {unreadCount === 1 ? "update" : "updates"}
            </Text>
          </View>
        ) : null}
      </View>

      {unreadCount > 0 ? (
        <TouchableOpacity
          style={styles.markReadButton}
          onPress={onMarkAllRead}
          activeOpacity={0.8}
        >
          <Text style={styles.markReadButtonText}>Mark all as read</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

