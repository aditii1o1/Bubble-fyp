import React, { useCallback, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { theme } from "../../constants/themes";
import { appActions, useAppContext } from "../../context/AppContext";
import { authService } from "../../services/authService";
import { confirmAlert } from "../../utils/alertUtils";
import { getAvatarEmoji } from "../../lib/avatars";
import NotificationsPanel from "../feed/NotificationsPanel";

export default function AdminProfileMenu() {
  const { state, dispatch } = useAppContext();
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const nickname = state.profile?.nickname || "@admin";
  const username = state.profile?.username || String(nickname).replace(/^@/, "");
  const email = state.user?.email || state.profile?.email || "";
  const avatarUrl = state.profile?.avatarUrl || null;
  const avatar = state.profile?.avatar || "cat";
  const unreadCount = (state.notifications || []).filter((item) => !item.read).length;

  const confirmLogout = useCallback(() => {
    setOpen(false);
    confirmAlert({
      title: "Log out",
      message: "Are you sure you want to log out of admin?",
      confirmText: "Log out",
      confirmStyle: "destructive",
      onConfirm: () => {
        (async () => {
          try {
            dispatch(appActions.logout());
            await authService.logout();
          } finally {
            router.replace("/(auth)/Login");
          }
        })();
      },
    });
  }, [dispatch]);

  return (
    <>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.trigger}
          onPress={() => setOpen(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Open admin profile menu"
        >
          <View style={styles.avatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>{getAvatarEmoji(avatar)}</Text>
            )}
          </View>
          <Ionicons name="chevron-down" size={14} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View style={styles.menu}>
            <View style={styles.profileRow}>
              <View style={styles.menuAvatar}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.menuAvatarEmoji}>{getAvatarEmoji(avatar)}</Text>
                )}
              </View>
              <View style={styles.profileText}>
                <Text style={styles.profileName}>{nickname}</Text>
                <Text style={styles.profileMeta} numberOfLines={1}>
                  @{username}
                </Text>
                {!!email && (
                  <Text style={styles.profileEmail} numberOfLines={1}>
                    {email}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setOpen(false);
                router.push("/(admin)");
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="grid-outline" size={17} color={theme.colors.text} />
              <Text style={styles.menuItemText}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setOpen(false);
                setShowNotifications(true);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="notifications-outline" size={17} color={theme.colors.text} />
              <Text style={styles.menuItemText}>Notifications</Text>
              {unreadCount > 0 ? (
                <Text style={styles.menuBadge}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={confirmLogout}
              activeOpacity={0.85}
            >
              <Ionicons name="log-out-outline" size={17} color={theme.colors.error} />
              <Text style={[styles.menuItemText, styles.logoutText]}>Log out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <NotificationsPanel
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        unreadCount={unreadCount}
      />
    </>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: theme.spacing.sm,
  },
  trigger: {
    height: 40,
    width: 58,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4,
    paddingRight: 9,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: theme.colors.bgCream,
    marginRight: 3,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarEmoji: {
    fontSize: 17,
  },
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
  },
  menu: {
    position: "absolute",
    top: 64,
    right: theme.spacing.lg,
    width: 258,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    padding: theme.spacing.sm,
    ...theme.shadow.medium,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  menuAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: theme.colors.bgCream,
    marginRight: theme.spacing.sm,
  },
  menuAvatarEmoji: {
    fontSize: 21,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  profileMeta: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  profileEmail: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  menuItem: {
    minHeight: 42,
    borderRadius: theme.borderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
  },
  menuItemText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  menuBadge: {
    overflow: "hidden",
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.text,
    textAlign: "center",
    fontSize: 10,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.white,
  },
  logoutItem: {
    marginTop: 2,
  },
  logoutText: {
    color: theme.colors.error,
  },
});
