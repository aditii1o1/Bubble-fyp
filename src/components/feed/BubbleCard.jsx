import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";
import TagChip from "./TagChip";
import EmojiReactionBar from "./EmojiReactionBar";
import CommentSection from "./CommentSection";
import { formatTimeRemaining, getPreviewText } from "../../lib/utils";
import ReportModal from "./ReportModal";
import RepostModal from "./RepostModal";

const { width } = Dimensions.get("window");

const AVATAR_EMOJIS = {
  cat: "😸",
  dog: "🐶",
  panda: "🐼",
  rabbit: "🐰",
  fox: "🦊",
  bear: "🐻",
  penguin: "🐧",
  owl: "🦉",
  dolphin: "🐬",
  unicorn: "🦄",
  default: "👤",
};

export const getAvatarEmoji = (avatarKey) => {
  return AVATAR_EMOJIS[avatarKey] || AVATAR_EMOJIS.default;
};

const BubbleCard = ({ bubble, onReact, onViewProfile }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [userReactions, setUserReactions] = useState(new Set());

  const timeRemaining = formatTimeRemaining(bubble.expiresAt);
  const isExpiringSoon = timeRemaining?.hours < 3;

  const handleReaction = (emoji) => {
    const newReactions = new Set(userReactions);
    if (newReactions.has(emoji)) {
      newReactions.delete(emoji);
    } else {
      newReactions.add(emoji);
    }
    setUserReactions(newReactions);
    onReact?.(bubble.id, emoji);
  };

  const handleRepost = (data) => {
    console.log("Reposting bubble:", bubble.id, data);
    setShowRepostModal(false);
  };

  const handleReport = (data) => {
    console.log("Reporting bubble:", bubble.id, data);
    setShowReportModal(false);
  };

  return (
    <>
      <View style={styles.container}>
        <Pressable
          style={styles.card}
          onPress={() => !isExpanded && setIsExpanded(true)}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={styles.userInfo}
              onPress={() => onViewProfile?.(bubble)}
            >
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarEmoji}>
                  {getAvatarEmoji(bubble.avatar || "cat")}
                </Text>
              </View>
              <View>
                <Text style={styles.nickname}>
                  {bubble.nickname || "Anonymous"}
                </Text>
                <Text style={styles.timestamp}>
                  {timeRemaining?.display || "24h"}
                </Text>
              </View>
            </Pressable>
            <View style={styles.headerRight}>
              <Text
                style={[styles.timer, isExpiringSoon && styles.timerExpiring]}
              >
                {timeRemaining?.display || "24h"}
              </Text>
              {isExpanded && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsExpanded(false)}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={theme.colors.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Title/Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.title}>
              {isExpanded ? bubble.text : getPreviewText(bubble.text, 100)}
            </Text>
            {!isExpanded && bubble.text.length > 100 && (
              <View style={styles.readMoreContainer}>
                <Text style={styles.readMore}>Tap to read more...</Text>
              </View>
            )}
          </View>

          {/* Tags */}
          {isExpanded && bubble.tags && bubble.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tagsScroll}
              >
                {bubble.tags.map((tag, index) => (
                  <TagChip key={index} tag={tag} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Reactions Bar */}
          <View style={styles.reactionContainer}>
            <EmojiReactionBar
              reactions={bubble.reactions || {}}
              userReactions={userReactions}
              onReact={handleReaction}
              onRepost={() => setShowRepostModal(true)}
              onReport={() => setShowReportModal(true)}
            />
          </View>

          {/* Comments Section */}
          {isExpanded && (
            <View style={styles.commentsContainer}>
              <CommentSection bubbleId={bubble.id} />
            </View>
          )}
        </Pressable>
      </View>

      {/* Repost Modal */}
      {showRepostModal && (
        <Modal
          visible={showRepostModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowRepostModal(false)}
        >
          <RepostModal
            bubble={bubble}
            onClose={() => setShowRepostModal(false)}
            onRepost={handleRepost}
          />
        </Modal>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <Modal
          visible={showReportModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowReportModal(false)}
        >
          <ReportModal
            type="post"
            onClose={() => setShowReportModal(false)}
            onSubmit={handleReport}
          />
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.bgWhite,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: "hidden",
    ...theme.shadow.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.bgSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  nickname: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryPink,
  },
  timestamp: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontFamily: theme.fonts.regular,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  timer: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    marginRight: theme.spacing.sm,
  },
  timerExpiring: {
    color: theme.colors.warningOrange,
    fontFamily: theme.fonts.bold,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.bgMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textDark,
    lineHeight: 24,
  },
  readMoreContainer: {
    paddingTop: theme.spacing.sm,
  },
  readMore: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryPink,
  },
  imageContainer: {
    position: "relative",
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: theme.borderRadius.lg,
  },
  imageCollapsed: {
    height: 180,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(255, 249, 245, 0.95)",
  },
  tagsContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  tagsScroll: {
    flexDirection: "row",
  },
  reactionContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  commentsContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
});

export default BubbleCard;
