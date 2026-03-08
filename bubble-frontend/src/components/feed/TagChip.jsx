import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../../constants/themes";

const TagChip = ({ tag, onPress, selected = false }) => {
  const handlePress = () => {
    if (onPress) {
      onPress(tag);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selected]}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>#{tag}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  selected: {
    backgroundColor: theme.colors.primary,
  },
  text: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
  },
  selectedText: {
    color: theme.colors.buttonText,
  },
});

export default TagChip;
