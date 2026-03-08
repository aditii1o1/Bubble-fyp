import { StyleSheet } from "react-native";
import { theme } from "../constants/themes";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: theme.spacing.xl,
  },
  tabContent: {
    marginTop: theme.spacing.md,
  },
});

