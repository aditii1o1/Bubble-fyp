import { StyleSheet } from "react-native";
import { theme } from "../../constants/themes";

export const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: "center",
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontFamily: "Lora_700Bold",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    fontFamily: "Lora_400Regular",
    color: theme.colors.muted,
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  signupButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    fontFamily: "Lora_400Regular",
    color: theme.colors.muted,
  },
  loginLink: {
    fontSize: theme.fontSize.sm,
    fontFamily: "Lora_700Bold",
    color: theme.colors.primary,
  },
});
