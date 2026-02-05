import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";
import { formatTimeAgo } from "../../lib/utils";
import { getAvatarEmoji } from "./AvatarPicker";
import ReportModal from "./ReportModal";

const COMMENT_REACTIONS = ["❤️", "😂", "😮", "😢", "🔥"];

const CommentSection = ({ bubbleId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingComment, setReportingComment] = useState(null);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newCommentObj = {
      id: `comment_${Date.now()}`,
      bubbleId,
      nickname: "@anonymous_user",
      avatar: "cat",
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
      reactions: { "❤️": 0, "😂": 0, "😮": 0, "😢": 0, "🔥": 0 },
    };

    setComments([newCommentObj, ...comments]);
    setNewComment("");
    setIsSubmitting(false);
  };

  const handleReaction = (commentId, emoji) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              reactions: {
                ...comment.reactions,
                [emoji]: (comment.reactions[emoji] || 0) + 1,
              },
            }
          : comment
      )
    );
  };

  const handleReport = (data) => {
    console.log("Report comment:", reportingComment?.id, data);
    setShowReportModal(false);
    setReportingComment(null);
  };

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={styles.commentCount}>
            <Text style={styles.commentCountText}>{comments.length}</Text>
          </View>
        </View>

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.textarea}
            placeholder="Share your thoughts anonymously..."
            placeholderTextColor={theme.colors.textMuted}
            value={newComment}
            onChangeText={setNewComment}
            maxLength={500}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <View style={styles.inputFooter}>
            <Text style={styles.charCount}>{newComment.length}/500</Text>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!newComment.trim() || isSubmitting) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Posting..." : "Post"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Comments List */}
        <ScrollView style={styles.commentsList}>
          {comments.length === 0 ? (
            <Text style={styles.emptyText}>
              No comments yet. Be the first to share!
            </Text>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Pressable style={styles.userInfo}>
                    <Text style={styles.commentAvatar}>
                      {getAvatarEmoji(comment.avatar || "cat")}
                    </Text>
                    <Text style={styles.commentNickname}>
                      {comment.nickname}
                    </Text>
                  </Pressable>
                  <View style={styles.commentHeaderRight}>
                    <Text style={styles.commentTime}>
                      {formatTimeAgo(comment.createdAt)}
                    </Text>
                    <TouchableOpacity
                      style={styles.reportButton}
                      onPress={() => {
                        setReportingComment(comment);
                        setShowReportModal(true);
                      }}
                    >
                      <Ionicons
                        name="warning-outline"
                        size={16}
                        color={theme.colors.errorRed}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>

                <View style={styles.reactionBar}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.emojiRow}
                  >
                    {COMMENT_REACTIONS.map((emoji) => (
                      <Pressable
                        key={emoji}
                        style={styles.emojiButton}
                        onPress={() => handleReaction(comment.id, emoji)}
                      >
                        <Text style={styles.emoji}>{emoji}</Text>
                        {comment.reactions[emoji] > 0 && (
                          <Text style={styles.emojiCount}>
                            {comment.reactions[emoji]}
                          </Text>
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Report Modal */}
      {showReportModal && (
        <Modal
          visible={showReportModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowReportModal(false);
            setReportingComment(null);
          }}
        >
          <ReportModal
            type="comment"
            onClose={() => {
              setShowReportModal(false);
              setReportingComment(null);
            }}
            onSubmit={handleReport}
          />
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textDark,
  },
  commentCount: {
    backgroundColor: theme.colors.bgSoft,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  commentCountText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  inputContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  textarea: {
    width: "100%",
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textDark,
    textAlignVertical: "top",
    minHeight: 80,
    maxHeight: 120,
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  charCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  submitButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primaryPink,
    borderRadius: theme.borderRadius.round,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.bold,
    color: theme.colors.white,
  },
  commentsList: {
    paddingHorizontal: theme.spacing.lg,
    maxHeight: 400,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: "center",
    paddingVertical: theme.spacing.xl,
    fontFamily: theme.fonts.regular,
  },
  commentCard: {
    backgroundColor: theme.colors.bgCream,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  commentAvatar: {
    fontSize: 18,
  },
  commentNickname: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryPink,
  },
  commentHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  commentTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  reportButton: {
    padding: 4,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bgWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  commentText: {
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  reactionBar: {
    marginTop: theme.spacing.xs,
  },
  emojiRow: {
    flexDirection: "row",
  },
  emojiButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.bgWhite,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.xs,
  },
  emoji: {
    fontSize: 14,
  },
  emojiCount: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
});

export default CommentSection;
