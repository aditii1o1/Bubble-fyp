import { StyleSheet } from "react-native";
import { theme } from "../../../constants/themes";

export const styles = StyleSheet.create({
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
  reactions: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  reactionButton: {
    minWidth: 56,
    height: 36,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.xs,
  },
  reactionButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.primaryPink,
  },
  reactionEmoji: {
    fontSize: 17,
    lineHeight: 20,
  },
  reactionCount: {
    marginLeft: 5,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textMuted,
  },
  reactionCountActive: {
    color: theme.colors.primaryPink,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
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
  iconButtonRight: {
    marginLeft: theme.spacing.xs,
  },
});
