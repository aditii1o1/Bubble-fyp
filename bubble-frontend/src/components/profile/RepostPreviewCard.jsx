import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";
import { commonStyles } from "../../styles/commonStyles";
import { getPreviewText } from "../../lib/utils";

export default function RepostPreviewCard({ repost, onPress, onDelete }) {
  return (
    <TouchableOpacity
      style={[commonStyles.card, styles.card]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.author}>{repost.originalAuthor}</Text>
        {onDelete ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.text}>{getPreviewText(repost.originalText, 100)}</Text>

      {repost.overlayText ? (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>{repost.overlayText}</Text>
        </View>
      ) : null}

      <Text style={styles.time}>{repost.timeAgo}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  author: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  iconBtn: {
    padding: theme.spacing.xs,
  },
  text: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  overlay: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  overlayText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
    fontStyle: "italic",
  },
  time: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
});

