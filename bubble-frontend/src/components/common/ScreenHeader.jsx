import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";
import { commonStyles } from "../../styles/commonStyles";

export default function ScreenHeader({
  title,
  onBack,
  rightIcon,
  onRightPress,
  rightAccessibilityLabel = "Header action",
}) {
  return (
    <View style={commonStyles.header}>
      {onBack ? (
        <TouchableOpacity
          style={commonStyles.iconButton}
          onPress={onBack}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={commonStyles.iconButtonSpacer} />
      )}

      <Text style={commonStyles.headerTitle}>{title}</Text>

      {rightIcon ? (
        <TouchableOpacity
          style={commonStyles.iconButton}
          onPress={onRightPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={rightAccessibilityLabel}
        >
          <Ionicons name={rightIcon} size={18} color={theme.colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={commonStyles.iconButtonSpacer} />
      )}
    </View>
  );
}
