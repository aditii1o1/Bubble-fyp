import { StyleSheet } from "react-native";
import { theme } from "../constants/themes";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  tabContent: {
    marginTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  bottomSpacing: {
    height: theme.spacing.xxxl,
  },
});

