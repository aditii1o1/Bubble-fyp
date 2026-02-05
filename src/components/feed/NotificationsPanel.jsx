// src/components/header/NotificationsPanel.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";

const mockNotifications = [
  {
    id: "notif_1",
    type: "reaction",
    emoji: "❤️",
    user: "@gentle_soul",
    time: "2m ago",
    read: false,
  },
  {
    id: "notif_2",
    type: "comment",
    emoji: "💬",
    user: "@supportive_friend",
    time: "15m ago",
    read: false,
  },
  {
    id: "notif_3",
    type: "reaction",
    emoji: "💡",
    user: "@midnight_thinker",
    time: "1h ago",
    read: true,
  },
  {
    id: "notif_4",
    type: "comment",
    emoji: "💬",
    user: "@quiet_observer",
    time: "3h ago",
    read: true,
  },
  {
    id: "notif_5",
    type: "repost",
    emoji: "🔄",
    user: "@anxious_student",
    time: "1d ago",
    read: true,
  },
];

const NotificationsPanel = ({ visible, onClose, unreadCount = 0 }) => {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const getNotificationText = (notif) => {
    if (notif.type === "reaction") {
      return `${notif.user} reacted to your bubble`;
    } else if (notif.type === "comment") {
      return `${notif.user} commented on your bubble`;
    } else {
      return `${notif.user} reposted your bubble`;
    }
  };

  const getEmojiBackground = (type) => {
    const colors = {
      reaction: theme.colors.primaryPink + "15",
      comment: theme.colors.primaryPink + "10",
      repost: theme.colors.primaryPink + "05",
    };
    return colors[type] || theme.colors.primaryPink + "10";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Panel */}
        <View style={styles.panel}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.primaryPink}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.title}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.subtitleContainer}>
                  <View style={styles.subtitleDot} />
                  <Text style={styles.subtitle}>
                    {unreadCount} new {unreadCount === 1 ? "update" : "updates"}
                  </Text>
                </View>
              )}
            </View>

            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.markReadButton}
                onPress={markAllNotificationsRead}
              >
                <Text style={styles.markReadButtonText}>Mark all as read</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* List */}
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {notifications.length === 0 ? (
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
            ) : (
              notifications.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.item, !notif.read && styles.itemUnread]}
                  onPress={() => markNotificationRead(notif.id)}
                >
                  <View
                    style={[
                      styles.itemIcon,
                      { backgroundColor: getEmojiBackground(notif.type) },
                    ]}
                  >
                    <Text style={styles.emoji}>{notif.emoji}</Text>
                  </View>

                  <View style={styles.itemContent}>
                    <Text style={styles.itemText}>
                      {getNotificationText(notif)}
                    </Text>
                    <Text style={styles.itemTime}>{notif.time}</Text>
                  </View>

                  {!notif.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationsPanel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 182, 193, 0.2)",
  },
  panel: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "85%",
    maxWidth: 380,
    backgroundColor: theme.colors.bgWhite,
    shadowColor: theme.colors.primaryPink,
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primaryPink + "20",
    backgroundColor: theme.colors.bgWhite,
  },
  headerTop: {
    alignItems: "flex-end",
    marginBottom: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryPink + "10",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.primaryPink + "20",
  },
  headerContent: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textDark,
    marginBottom: 4,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subtitleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primaryPink,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.primaryPink,
  },
  markReadButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.primaryPink + "10",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primaryPink + "20",
  },
  markReadButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.primaryPink,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryPink + "10",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.primaryPink + "20",
  },
  emptyText: {
    fontSize: 18,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.primaryPink,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.primaryPink + "80",
    textAlign: "center",
    lineHeight: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primaryPink + "10",
  },
  itemUnread: {
    backgroundColor: theme.colors.primaryPink + "05",
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: theme.colors.primaryPink + "20",
  },
  emoji: {
    fontSize: 20,
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textDark, // Changed to black
    marginBottom: 4,
    lineHeight: 20,
  },
  itemTime: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.primaryPink, // Pink time
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primaryPink,
    marginLeft: 12,
  },
});
