import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";

export default function HeartLikeButton({
  liked = false,
  count = 0,
  onPress,
  size = 20,
  showCount = true,
  style,
}) {
  const safeCount = Number.isFinite(Number(count)) ? Number(count) : 0;
  const iconName = liked ? "heart" : "heart-outline";
  const iconColor = liked ? theme.colors.primaryPink : theme.colors.textMuted;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 999,
          backgroundColor: theme.colors.bgCream,
          borderWidth: 1,
          borderColor: theme.colors.borderLight,
        },
        style,
      ]}
    >
      <Ionicons name={iconName} size={size} color={iconColor} />
      {showCount ? (
        <View style={{ marginLeft: 6 }}>
          <Text
            style={{
              fontSize: 12,
              fontFamily: theme.fonts.bold,
              color: theme.colors.textDark,
            }}
          >
            {safeCount}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

