import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";
import { commonStyles } from "../../styles/commonStyles";
import TagChip from "../feed/TagChip";
import { formatTimeAgo, getPreviewText } from "../../lib/utils";
import { styles } from "./PostPreviewCard.styles";

const REACTIONS = [{ key: "heart", emoji: "❤️" }];

export default function PostPreviewCard({ bubble, onPress, onDelete }) {
  const commentCount = bubble.commentCount || bubble.comments || 0;
  const hasTitle = String(bubble.title || "").trim().length > 0;

  return (
    <TouchableOpacity
      style={[commonStyles.card, styles.card]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.time}>{formatTimeAgo(bubble.createdAt)}</Text>
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

      {hasTitle ? (
        <Text style={styles.title} numberOfLines={2}>
          {bubble.title}
        </Text>
      ) : null}
      <Text style={styles.text}>{getPreviewText(bubble.text, 120)}</Text>

      {bubble.tags?.length ? (
        <View style={styles.tags}>
          {bubble.tags.slice(0, 3).map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.reactions}>
          {REACTIONS.map(({ key, emoji }) => {
            const count = bubble.reactions?.[key] || 0;
            if (!count) return null;
            return (
              <View key={key} style={styles.reactionItem}>
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                <Text style={styles.reactionCount}>{count}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.comments}>
          <Ionicons
            name="chatbubble-outline"
            size={14}
            color={theme.colors.muted}
          />
          <Text style={styles.commentText}>{commentCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
