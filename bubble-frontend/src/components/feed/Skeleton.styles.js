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
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
});

