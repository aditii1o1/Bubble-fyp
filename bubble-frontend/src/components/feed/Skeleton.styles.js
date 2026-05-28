import { StyleSheet } from "react-native";
import { theme } from "../../constants/themes";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    marginBottom: theme.spacing.lg,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primaryPink,
    marginRight: theme.spacing.sm,
  },
  labelText: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primaryPink,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface2,
    marginRight: theme.spacing.md,
  },
  meta: {
    flex: 1,
  },
  line: {
    height: 12,
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  lineShort: {
    width: "60%",
  },
  lineVeryShort: {
    width: "40%",
  },
  lineFull: {
    width: "100%",
    height: 16,
  },
  lineMedium: {
    width: "90%",
    height: 16,
  },
  lineSmall: {
    width: "70%",
    height: 16,
  },
  tags: {
    flexDirection: "row",
    marginTop: theme.spacing.sm,
  },
  tag: {
    width: 60,
    height: 24,
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.sm,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "55%",
  },
  shimmerGradient: {
    flex: 1,
  },
});

