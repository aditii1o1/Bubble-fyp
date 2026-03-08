import { StyleSheet } from "react-native";
import { theme } from "../../constants/themes";

export const styles = StyleSheet.create({
  card: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  time: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  iconBtn: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  text: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reactions: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: theme.spacing.sm,
  },
  reactionEmoji: {
    fontSize: theme.fontSize.sm,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  comments: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentText: {
    marginLeft: 4,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
});
