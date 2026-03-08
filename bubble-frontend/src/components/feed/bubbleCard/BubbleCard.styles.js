import { StyleSheet } from "react-native";
import { theme } from "../../../constants/themes";

export const styles = StyleSheet.create({
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
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
  postTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textDark,
    lineHeight: 24,
    marginBottom: 6,
  },
  postBody: {
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
