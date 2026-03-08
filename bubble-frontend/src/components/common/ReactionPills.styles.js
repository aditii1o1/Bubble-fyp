import { StyleSheet } from "react-native";
import { theme } from "../../constants/themes";

export const styles = StyleSheet.create({
  scrollContent: {
    paddingRight: theme.spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginRight: theme.spacing.xs,
    minWidth: 40,
  },
  pillActive: {
    backgroundColor: theme.colors.primaryPink + "15",
    borderColor: theme.colors.primaryPink,
  },
  pillIcon: {
    color: theme.colors.textMuted,
  },
  pillIconActive: {
    color: theme.colors.primaryPink,
  },
  pillCount: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primaryPink, // not black
  },
});

