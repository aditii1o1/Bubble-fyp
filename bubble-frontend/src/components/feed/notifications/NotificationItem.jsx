import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./NotificationsPanel.styles";

export default function NotificationItem({ notif, text, iconBg, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.item, !notif.read && styles.itemUnread]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.itemIcon, { backgroundColor: iconBg }]}>
        <Text style={styles.emoji}>{notif.emoji}</Text>
      </View>

      <View style={styles.itemContent}>
        <Text style={styles.itemText}>{text}</Text>
        <Text style={styles.itemTime}>{notif.time}</Text>
      </View>

      {!notif.read ? <View style={styles.unreadDot} /> : null}
    </TouchableOpacity>
  );
}

