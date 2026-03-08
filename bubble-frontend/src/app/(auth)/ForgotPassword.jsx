// app/(auth)/ForgotPassword.jsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "../../components/common/AuthLayout";
import ControlledInput from "../../components/common/ControlledInput";
import CustomButton from "../../components/common/CustomButton";
import { forgotPasswordSchema } from "../../utils/validationSchemas";
import { styles } from "../../screens/auth/ForgotPassword.styles";
import { authService } from "../../services/authService";
import { getAuthErrorMessage } from "../../utils/authError";
import { useToast } from "../../context/ToastContext";

export default function ForgotPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const email = String(data.email || "").trim().toLowerCase();
      await authService.resetPassword(email);

      showToast("Reset link sent. Check your email.", { type: "success" });
    } catch (error) {
      showToast(getAuthErrorMessage(error), { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.header}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send a reset link.
        </Text>
      </View>

      <View style={styles.form}>
        <ControlledInput
          control={control}
          name="email"
          icon="email"
          iconType="material"
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleSubmit(onSubmit)}
        />

        <CustomButton
          title={isLoading || isSubmitting ? "Sending..." : "Send Reset Link"}
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading || isSubmitting}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Remembered your password? </Text>
        <Link href="/(auth)/Login" asChild>
          <TouchableOpacity>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </AuthLayout>
  );
}
