import { StyleSheet } from "react-native";
import { theme } from "../../constants/themes";

export const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.lg,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.bgWhite,
  },
  containerError: {
    borderColor: theme.colors.error || "#ef4444",
  },
  iconContainer: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textDark,
    fontFamily: theme.fontFamily.regular,
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  inputWithIcon: {
    paddingLeft: 44,
  },
  inputWithToggle: {
    paddingRight: 44,
  },
  toggleButton: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error || "#ef4444",
    fontFamily: theme.fontFamily.regular,
    marginTop: 4,
    marginLeft: 4,
  },
});

