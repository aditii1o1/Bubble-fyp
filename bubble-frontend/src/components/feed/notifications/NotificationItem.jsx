import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./NotificationsPanel.styles";
import { formatTimeAgo } from "../../../lib/utils";
import { theme } from "../../../constants/themes";

function getNotificationIcon(type) {
  switch (type) {
    case "reaction":
      return "heart";
    case "comment":
      return "chatbubble";
    case "repost":
      return "repeat";
    case "broadcast":
      return "megaphone";
    default:
      return "notifications";
  }
}

export default function NotificationItem({ notif, text, iconBg, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.item, !notif.read && styles.itemUnread]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.itemIcon, { backgroundColor: iconBg }]}>
        <Ionicons
          name={getNotificationIcon(notif.type)}
          size={18}
          color={theme.colors.primaryPink}
        />
      </View>

      <View style={styles.itemContent}>
        <Text style={styles.itemText}>{text}</Text>
        <Text style={styles.itemTime}>{formatTimeAgo(notif.createdAt)}</Text>
      </View>

      {!notif.read ? <View style={styles.unreadDot} /> : null}
    </TouchableOpacity>
  );
}
