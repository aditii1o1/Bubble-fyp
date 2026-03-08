import { StyleSheet } from "react-native";
import { theme } from "../../constants/themes";

export const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: 52,
    paddingHorizontal: theme.spacing.lg,
  },
  toast: {
    width: "100%",
    maxWidth: 520,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadow.small,
  },
  text: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.bold,
    textAlign: "center",
  },
});

