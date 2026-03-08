import { StyleSheet } from "react-native";
import { theme } from "../../../constants/themes";

export const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: theme.spacing.md,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textDark,
  },
  commentCount: {
    marginLeft: theme.spacing.sm,
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
  },
  commentAvatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.bgWhite,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  commentAvatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  commentAvatar: {
    fontSize: 18,
  },
  commentNickname: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryPink,
  },
  commentHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  actionButton: {
    marginLeft: theme.spacing.sm,
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
    marginLeft: 2,
    fontSize: 11,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
});
