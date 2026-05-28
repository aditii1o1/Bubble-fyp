import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/themes";
import { styles } from "./EmojiReactionBar.styles";
import { REACTION_OPTIONS } from "../../../constants/reactions";

export default function EmojiReactionBar({
  reactions,
  activeReaction = null,
  onReact,
  onRepost,
  onReport,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.reactions}>
          {REACTION_OPTIONS.map((reaction) => {
            const isActive = activeReaction === reaction.key;
            const count = Number(reactions?.[reaction.key] || 0);

            return (
              <TouchableOpacity
                key={reaction.key}
                style={[styles.reactionButton, isActive && styles.reactionButtonActive]}
                onPress={() => onReact?.(reaction.key)}
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityLabel={`${reaction.label} reaction`}
              >
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                <Text style={[styles.reactionCount, isActive && styles.reactionCountActive]}>
                  {count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={onRepost} activeOpacity={0.7}>
            <Ionicons name="repeat-outline" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.iconButtonRight]}
            onPress={onReport}
            activeOpacity={0.7}
          >
            <Ionicons name="warning-outline" size={18} color={theme.colors.errorRed} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
