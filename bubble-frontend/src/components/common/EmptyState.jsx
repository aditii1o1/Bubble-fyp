import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";

export default function EmptyState({
  icon = "alert-circle-outline",
  title = "Nothing here",
  message,
  actionLabel,
  onActionPress,
}) {
  return (
    <View style={styles.container}>
      {icon ? (
        <Ionicons name={icon} size={48} color={theme.colors.muted} />
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {actionLabel && onActionPress ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onActionPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    textAlign: "center",
  },
  message: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.white,
  },
});

