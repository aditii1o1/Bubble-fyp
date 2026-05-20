import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { theme } from "../../constants/themes";
import { commonStyles } from "../../styles/commonStyles";
import { getAvatarEmoji } from "../../lib/avatars";

export default function UserCard({ user, onToggleBan, loading = false, disabled = false }) {
  const buttonLabel = user.isSelf
    ? "You"
    : loading
      ? user.isBanned
        ? "Unbanning..."
        : "Banning..."
      : user.isBanned
        ? "Unban"
        : "Ban";
  const isDisabled = disabled || loading;

  return (
    <View style={[commonStyles.card, styles.card]}>
      <View style={styles.left}>
        <View style={styles.avatarCircle}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarEmoji}>{getAvatarEmoji(user.avatar)}</Text>
          )}
        </View>
        <View style={styles.userText}>
          <Text style={styles.nickname}>{user.nickname}</Text>
          {!!user.username && <Text style={styles.username}>@{user.username}</Text>}
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.status}>
            Status: {user.isBanned ? "banned" : "active"}
            {user.isSelf ? " | You" : ""}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.banButton,
          user.isBanned && styles.unbanButton,
          isDisabled && styles.disabledButton,
        ]}
        onPress={onToggleBan}
        activeOpacity={0.8}
        disabled={isDisabled}
      >
        <Text style={[styles.banText, user.isBanned && styles.unbanText]}>
          {buttonLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: theme.spacing.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  userText: {
    flex: 1,
  },
  nickname: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  username: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.primaryPink,
  },
  email: {
    marginTop: 2,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.muted,
  },
  status: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  banButton: {
    height: 40,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  banText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.white,
  },
  unbanButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  unbanText: {
    color: theme.colors.text,
  },
  disabledButton: {
    opacity: 0.55,
  },
});
