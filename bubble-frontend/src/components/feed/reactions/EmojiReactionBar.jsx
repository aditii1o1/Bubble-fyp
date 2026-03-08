import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/themes";
import { styles } from "./EmojiReactionBar.styles";
import HeartLikeButton from "../../common/HeartLikeButton";

export default function EmojiReactionBar({
  reactions,
  activeReaction = null,
  onReact,
  onRepost,
  onReport,
}) {
  const liked = activeReaction === "heart";
  const likeCount = Number(reactions?.heart || 0);
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.reactions}>
          <HeartLikeButton
            liked={liked}
            count={likeCount}
            onPress={() => onReact?.("heart")}
          />
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
