import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";
import { commonStyles } from "../../styles/commonStyles";

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  rightAction, // { label, onPress } (optional)
}) {
  return (
    <View style={[commonStyles.searchBar, styles.container]}>
      <Ionicons name="search" size={18} color={theme.colors.textMuted} />
      <TextInput
        style={commonStyles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {rightAction ? (
        <TouchableOpacity
          style={styles.rightButton}
          onPress={rightAction.onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.rightButtonText}>{rightAction.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  rightButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.accent,
  },
  rightButtonText: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
});
