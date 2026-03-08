import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../../../constants/themes";

function ActionButton({ label, onPress, disabled = false, variant = "primary" }) {
  const buttonStyle = [
    styles.button,
    variant === "secondary" && styles.secondary,
    variant === "danger" && styles.danger,
    disabled && styles.disabled,
  ];

  const textStyle = [
    styles.buttonText,
    variant === "secondary" && styles.secondaryText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ReportActions({
  onResolve,
  onToggleBan,
  banLabel,
  banDisabled,
  onDeleteContent,
}) {
  return (
    <View style={styles.container}>
      <ActionButton label="Mark Resolved" onPress={onResolve} />
      <ActionButton
        label={banLabel}
        onPress={onToggleBan}
        disabled={banDisabled}
        variant="secondary"
      />
      <ActionButton label="Delete Content" onPress={onDeleteContent} variant="danger" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.sm,
  },
  button: {
    height: 50,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.small,
  },
  secondary: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  danger: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.error,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.white,
  },
  secondaryText: {
    color: theme.colors.textDark,
  },
});

