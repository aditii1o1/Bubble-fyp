// src/components/common/CustomButton.jsx
// ✅ FINAL VERSION - Reusable button component
import React, { memo } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { theme } from "../../constants/themes";

const CustomButton = memo(
  ({ title, variant = "primary", style, ...touchableProps }) => {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          variant === "primary" ? styles.primaryButton : styles.secondaryButton,
          style,
        ]}
        {...touchableProps}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    );
  }
);

CustomButton.displayName = "CustomButton";

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadow.medium,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
  },
});

export default CustomButton;
