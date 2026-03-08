import { StyleSheet, Platform } from "react-native";
import { theme } from "../../../constants/themes";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    backgroundColor: theme.colors.bgWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    marginTop: "auto",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.textDark,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  preview: {
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.textDark,
    marginBottom: 10,
  },
  previewCard: {
    backgroundColor: theme.colors.bgCream,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    minHeight: 120,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginBottom: 12,
  },
  commentContainer: {
    backgroundColor: "#FFE4EC",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primaryPink,
  },
  commentText: {
    color: "#8A2D55",
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    lineHeight: 20,
  },
  previewText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textDark,
    fontFamily: theme.fontFamily.regular,
    lineHeight: 20,
  },
  ellipsis: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textDark,
    fontFamily: theme.fontFamily.regular,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.textDark,
    marginBottom: 10,
  },
  textarea: {
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: 12,
    padding: 14,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textDark,
    minHeight: 80,
  },
  charCount: {
    textAlign: "right",
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 6,
    marginBottom: 16,
    fontFamily: theme.fontFamily.regular,
  },
  repostButton: {
    backgroundColor: theme.colors.primaryPink,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 34 : 20,
  },
  repostButtonDisabled: {
    opacity: 0.5,
  },
  repostButtonText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.white,
  },
});

