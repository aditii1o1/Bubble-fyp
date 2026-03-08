import React from "react";
import { View, Text, TouchableOpacity, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/themes";
import { getAvatarEmoji } from "../../../lib/avatars";
import { styles } from "./BubbleCard.styles";

export default function BubbleCardHeader({
  bubble,
  timeText,
  isExpanded,
  isExpiringSoon,
  onClose,
  onViewProfile,
}) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.userInfo} onPress={() => onViewProfile?.(bubble)}>
        <View style={styles.avatarContainer}>
          {bubble.avatarUrl ? (
            <Image source={{ uri: bubble.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarEmoji}>{getAvatarEmoji(bubble.avatar || "cat")}</Text>
          )}
        </View>
        <View>
          <Text style={styles.nickname}>{bubble.nickname || "Anonymous"}</Text>
          <Text style={styles.timestamp}>{timeText || "24h"}</Text>
        </View>
      </Pressable>

      <View style={styles.headerRight}>
        <Text style={[styles.timer, isExpiringSoon && styles.timerExpiring]}>
          {timeText || "24h"}
        </Text>
        {isExpanded ? (
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
