import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import AuthLayout from "../../components/common/AuthLayout";
import CustomButton from "../../components/common/CustomButton";
import { theme } from "../../constants/themes";
import { authService } from "../../services/authService";
import { useToast } from "../../context/ToastContext";
import { getAuthErrorMessage } from "../../utils/authError";

function getParamValue(value) {
  if (Array.isArray(value)) return String(value[0] || "");
  return String(value || "");
}

export default function VerifyEmailSentScreen() {
  const params = useLocalSearchParams();
  const { showToast } = useToast();
  const [isResending, setIsResending] = useState(false);

  const email = useMemo(() => getParamValue(params.email).trim().toLowerCase(), [params.email]);

  const handleResend = async () => {
    if (!email || isResending) return;

    try {
      setIsResending(true);
      await authService.resendVerificationEmail({ email });
      showToast("Verification link sent. Check your inbox.", { type: "success" });
    } catch (error) {
      showToast(getAuthErrorMessage(error), { type: "error" });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.card}>
        <Text style={styles.kicker}>Email verification</Text>
        <Text style={styles.title}>Check your inbox</Text>
        <Text style={styles.subtitle}>
          Your age check passed. We sent a secure verification link to
          {email ? ` ${email}` : " your email"}. Open that link, then come back
          to sign in.
        </Text>

        <View style={styles.note}>
          <Text style={styles.noteTitle}>Why this step?</Text>
          <Text style={styles.noteText}>
            OCR confirms age. Email verification confirms account ownership.
          </Text>
        </View>

        <CustomButton
          title={isResending ? "Sending link..." : "Resend Verification Link"}
          onPress={handleResend}
          loading={isResending}
          disabled={!email || isResending}
          style={styles.primaryButton}
        />

        <CustomButton
          title="Back to Sign In"
          variant="outline"
          onPress={() => router.replace("/(auth)/Login")}
          disabled={isResending}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Used the wrong email? </Text>
          <Link href="/(auth)/Signup" asChild>
            <TouchableOpacity disabled={isResending}>
              <Text style={styles.footerLink}>Create a new account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 420,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadow.small,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.textMuted,
  },
  title: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.xxl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    lineHeight: 22,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textLight,
  },
  note: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  noteTitle: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  noteText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  primaryButton: {
    marginBottom: theme.spacing.md,
  },
  footer: {
    marginTop: theme.spacing.lg,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  footerLink: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primaryPink,
  },
});
