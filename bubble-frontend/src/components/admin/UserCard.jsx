import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { theme } from "../../constants/themes";
import { commonStyles, withAlpha } from "../../styles/commonStyles";
import { getAvatarEmoji } from "../../lib/avatars";
import { formatJoinedDate } from "../../lib/utils";

function Pill({ label, tone = theme.colors.primaryPink, subtle = false }) {
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: subtle ? theme.colors.bgWhite : withAlpha(tone, "18"),
          borderColor: withAlpha(tone, subtle ? "35" : "20"),
        },
      ]}
    >
      <Text style={[styles.pillText, { color: tone }]}>{label}</Text>
    </View>
  );
}

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
      <View style={styles.headerRow}>
        <View style={styles.identityRow}>
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
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.banButton,
            user.isBanned && styles.unbanButton,
            isDisabled && styles.disabledButton,
          ]}
          onPress={onToggleBan}
          activeOpacity={0.85}
          disabled={isDisabled}
        >
          <Text style={[styles.banText, user.isBanned && styles.unbanText]}>
            {buttonLabel}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pillRow}>
        <Pill label={user.role === "admin" ? "Admin" : "User"} tone="#0EA5E9" />
        <Pill label={user.isBanned ? "Banned" : "Active"} tone={user.isBanned ? "#EF4444" : "#10B981"} />
        <Pill label={user.onboarded ? "Onboarded" : "Pending"} tone="#F59E0B" />
        {user.isSelf ? <Pill label="Your account" subtle /> : null}
      </View>

      {!!user.bio && (
        <Text style={styles.bio} numberOfLines={2}>
          {user.bio}
        </Text>
      )}

      <Text style={styles.footerMeta}>
        Joined {formatJoinedDate(user.createdAt) || "recently"} | ID {user.id}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: theme.spacing.md,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
    overflow: "hidden",
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarEmoji: {
    fontSize: 24,
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
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primaryPink,
  },
  email: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.muted,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  pill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontFamily: theme.fontFamily.bold,
  },
  bio: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textLight,
  },
  footerMeta: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  banButton: {
    minWidth: 88,
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
