import { StyleSheet } from "react-native";
import { theme } from "../constants/themes";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bgWhite,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgWhite,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  topSpacing: {
    height: 30,
  },
  bottomSpacing: {
    height: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 22,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.textDark,
  },
  iconSpacer: {
    width: 24,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.bgSoft,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  infoText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.textMuted,
    flex: 1,
    fontSize: theme.fontSize.sm,
  },
  titleInput: {
    backgroundColor: theme.colors.bgCream,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textDark,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: theme.spacing.md,
  },
  textInput: {
    backgroundColor: theme.colors.bgCream,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textDark,
    minHeight: 160,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    lineHeight: 22,
  },
  inputError: {
    borderColor: theme.colors.errorRed,
  },
  errorText: {
    color: theme.colors.errorRed,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
    fontFamily: theme.fontFamily.regular,
  },
  submitButton: {
    marginTop: theme.spacing.xl,
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgSoft,
    borderRadius: theme.borderRadius.md,
  },
  privacyText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    flex: 1,
    lineHeight: 18,
  },
});
