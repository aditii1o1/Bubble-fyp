import { StyleSheet } from "react-native";
import { theme } from "../constants/themes";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgCream,
  },
  content: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textDark,
    textAlign: "center",
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.bgWhite,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    padding: theme.spacing.lg,
    ...theme.shadow.small,
  },
  label: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textDark,
  },
  helper: {
    marginTop: -theme.spacing.xs,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  input: {
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textDark,
    fontFamily: theme.fonts.regular,
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: theme.colors.bgSoft,
  },
  bioInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  button: {
    marginTop: theme.spacing.sm,
  },
  primaryButton: {
    marginTop: theme.spacing.xl,
  },
});
