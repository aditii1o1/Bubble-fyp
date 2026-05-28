import { StyleSheet } from "react-native";
import { theme } from "../../constants/themes";

export const styles = StyleSheet.create({
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  stepBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    marginBottom: theme.spacing.md,
  },
  stepBadgeText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primaryPink,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.muted,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  noteCard: {
    backgroundColor: theme.colors.bgWhite,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.small,
  },
  noteTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  noteText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  cameraCard: {
    height: 250,
    borderRadius: theme.borderRadius.xxl,
    overflow: "hidden",
    backgroundColor: "#1F1A1C",
    marginBottom: theme.spacing.md,
    ...theme.shadow.medium,
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: "#FFF3F6",
  },
  placeholderTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  placeholderText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textLight,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  inlineButton: {
    minWidth: 160,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(51, 51, 51, 0.55)",
  },
  processingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.white,
  },
  helperText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.muted,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  actions: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.borderSoft,
  },
  resultCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.small,
  },
  passCard: {
    backgroundColor: "#F4FBF6",
    borderColor: "#BFE6C6",
  },
  failCard: {
    backgroundColor: "#FFF5F5",
    borderColor: "#F6C1C1",
  },
  retryCard: {
    backgroundColor: "#FFF8F2",
    borderColor: "#F4D4A9",
  },
  resultBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    marginBottom: theme.spacing.md,
  },
  passBadge: {
    backgroundColor: "#DDF3E0",
  },
  failBadge: {
    backgroundColor: "#FBE2E2",
  },
  retryBadge: {
    backgroundColor: "#FCE9D3",
  },
  resultBadgeText: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.bold,
    letterSpacing: 0.4,
  },
  passBadgeText: {
    color: "#287A3F",
  },
  failBadgeText: {
    color: "#C14C4C",
  },
  retryBadgeText: {
    color: "#B56A18",
  },
  resultHeading: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  resultMessage: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textLight,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  dobRow: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  dobLabel: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs,
  },
  dobValue: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  resultActions: {
    gap: theme.spacing.md,
  },
  debugCard: {
    backgroundColor: theme.colors.bgWhite,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.small,
  },
  debugTitle: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primaryPink,
    marginBottom: theme.spacing.sm,
  },
  debugText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  backLink: {
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  backLinkText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
  },
});
