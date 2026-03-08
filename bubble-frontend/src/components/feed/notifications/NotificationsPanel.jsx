import React, { useEffect } from "react";
import { View, Modal, Pressable, ScrollView } from "react-native";
import { theme } from "../../../constants/themes";
import { appActions, useAppContext } from "../../../context/AppContext";
import { notificationService } from "../../../services/notificationService";
import NotificationsHeader from "./NotificationsHeader";
import NotificationItem from "./NotificationItem";
import NotificationsEmptyState from "./NotificationsEmptyState";
import { styles } from "./NotificationsPanel.styles";

function getNotificationText(notif) {
  if (notif.text) return notif.text;
  if (notif.type === "reaction") return `${notif.user} reacted to your bubble`;
  if (notif.type === "comment") return `${notif.user} commented on your bubble`;
  return `${notif.user} reposted your bubble`;
}

function getEmojiBackground(type) {
  const colors = {
    reaction: theme.colors.primaryPink + "15",
    comment: theme.colors.primaryPink + "10",
    repost: theme.colors.primaryPink + "05",
  };
  return colors[type] || theme.colors.primaryPink + "10";
}

export default function NotificationsPanel({ visible, onClose, unreadCount = 0 }) {
  const { state, dispatch } = useAppContext();
  const notifications = state.notifications;
  const uid = state.user?.uid;

  // Refresh when opening so admin broadcasts show up quickly.
  useEffect(() => {
    if (!visible || !uid) return;
    (async () => {
      try {
        const items = await notificationService.getMyNotifications(uid, { pageSize: 30 });
        dispatch(appActions.setNotifications(items));
      } catch {
        // ignore
      }
    })();
  }, [dispatch, uid, visible]);

  const markNotificationRead = (id) => {
    dispatch(appActions.markNotificationRead(id));
    if (!uid) return;
    (async () => {
      try {
        await notificationService.markRead({ uid, notificationId: id });
      } catch {
        // ignore
      }
    })();
  };

  const markAllNotificationsRead = () => {
    dispatch(appActions.markAllNotificationsRead());
    if (!uid) return;
    (async () => {
      try {
        await notificationService.markAllRead({ uid });
      } catch {
        // ignore
      }
    })();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.panel}>
          <NotificationsHeader
            unreadCount={unreadCount}
            onClose={onClose}
            onMarkAllRead={markAllNotificationsRead}
          />

          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {notifications.length ? (
              notifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notif={notif}
                  text={getNotificationText(notif)}
                  iconBg={getEmojiBackground(notif.type)}
                  onPress={() => markNotificationRead(notif.id)}
                />
              ))
            ) : (
              <NotificationsEmptyState />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
