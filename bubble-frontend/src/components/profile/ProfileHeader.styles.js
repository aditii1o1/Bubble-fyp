import { StyleSheet } from "react-native";
import { theme } from "../../constants/themes";

export const styles = StyleSheet.create({
  card: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    alignItems: "center",
    position: "relative",
  },
  editButton: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  avatarButton: {
    alignItems: "center",
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarEmoji: {
    fontSize: 40,
  },
  avatarHint: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  nickname: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.xl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  email: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.muted,
  },
  bioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  bioLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.borderLight,
  },
  bio: {
    marginHorizontal: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.muted,
    textAlign: "center",
  },
  joined: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
});
