import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";

const REACTION_EMOJIS = ["❤️", "🤗", "😢"];

const EmojiReactionBar = ({
  reactions,
  userReactions,
  onReact,
  onRepost,
  onReport,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Scrollable emoji reactions on the left */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.emojiScroll}
          contentContainerStyle={styles.emojiScrollContent}
        >
          {REACTION_EMOJIS.map((emoji) => {
            const count = reactions[emoji] || 0;
            const isActive = userReactions.has(emoji);

            return (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiButton,
                  isActive && styles.emojiButtonActive,
                ]}
                onPress={() => onReact?.(emoji)}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>{emoji}</Text>
                {count > 0 && <Text style={styles.emojiCount}>{count}</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Fixed action buttons on the right */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onRepost}
            activeOpacity={0.7}
          >
            <Ionicons
              name="repeat-outline"
              size={18}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onReport}
            activeOpacity={0.7}
          >
            <Ionicons
              name="warning-outline"
              size={18}
              color={theme.colors.errorRed}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.bgWhite,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  emojiScroll: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  emojiScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  emojiButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.round,
    minWidth: 42,
    justifyContent: "center",
  },
  emojiButtonActive: {
    backgroundColor: theme.colors.primaryPink + "15",
    borderColor: theme.colors.primaryPink,
  },
  emoji: {
    fontSize: 14,
  },
  emojiCount: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textDark,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.round,
  },
});

export default EmojiReactionBar;
