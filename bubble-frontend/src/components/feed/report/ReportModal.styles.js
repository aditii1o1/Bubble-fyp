import { StyleSheet } from "react-native";
import { theme } from "../../../constants/themes";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
  },
  modal: {
    backgroundColor: theme.colors.bgWhite,
    borderRadius: theme.borderRadius.xl,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
    overflow: "hidden",
  },

  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    alignItems: "center",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryPink + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    padding: theme.spacing.xs,
  },

  content: {
    padding: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md,
  },
  sectionLabelSpaced: {
    marginTop: theme.spacing.lg,
  },

  reasonButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  reasonButtonSelected: {
    backgroundColor: theme.colors.primaryPink + "10",
    borderColor: theme.colors.primaryPink,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  radioOuterSelected: {
    borderColor: theme.colors.primaryPink,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primaryPink,
  },
  reasonText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textDark,
    flex: 1,
  },
  reasonTextSelected: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryPink,
  },

  textarea: {
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textDark,
    minHeight: 100,
    maxHeight: 150,
  },
  charCount: {
    textAlign: "right",
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },

  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryPink,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitIcon: {
    marginRight: theme.spacing.sm,
  },
  submitButtonText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fonts.bold,
    color: theme.colors.white,
  },
  disclaimer: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: theme.spacing.md,
    lineHeight: 18,
    paddingBottom: theme.spacing.md,
  },
});

