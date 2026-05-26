// app/(auth)/Signup.jsx
import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "../../components/common/AuthLayout";
import ControlledInput from "../../components/common/ControlledInput";
import CustomButton from "../../components/common/CustomButton";
import { signupSchema } from "../../utils/validationSchemas";
import { styles } from "../../screens/auth/Signup.styles";
import { useToast } from "../../context/ToastContext";
import { pendingSignupService } from "../../services/pendingSignupService";

export default function SignupScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const submitLockRef = useRef(false);
  const { showToast } = useToast();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    setFocus,
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur", // Changed from onChange for better UX
  });

  const onSubmit = async (data) => {
    if (submitLockRef.current) return;

    try {
      submitLockRef.current = true;
      setIsLoading(true);
      const email = String(data.email || "").trim().toLowerCase();
      const password = String(data.password || "");
      const pendingKey = pendingSignupService.save({ email, password });

      router.push({
        pathname: "/(auth)/VerifyAge",
        params: { pendingKey, email },
      });
    } catch (error) {
      showToast("Could not start age verification. Please try again.", {
        type: "error",
      });
    } finally {
      submitLockRef.current = false;
      setIsLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <AuthLayout scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the Bubble</Text>
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
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => setFocus("password")}
          blurOnSubmit={false}
          ref={emailRef}
        />

        <ControlledInput
          control={control}
          name="password"
          icon="lock"
          iconType="feather"
          placeholder="Create password"
          secureTextEntry={!showPassword}
          showPasswordToggle
          isPasswordVisible={showPassword}
          onTogglePassword={togglePassword}
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect={false}
          spellCheck={false}
          textContentType="oneTimeCode"
          passwordRules="minlength: 6;"
          returnKeyType="next"
          onSubmitEditing={() => setFocus("confirmPassword")}
          blurOnSubmit={false}
          ref={passwordRef}
        />

        <ControlledInput
          control={control}
          name="confirmPassword"
          icon="lock"
          iconType="feather"
          placeholder="Confirm password"
          secureTextEntry={!showConfirmPassword}
          showPasswordToggle
          isPasswordVisible={showConfirmPassword}
          onTogglePassword={toggleConfirmPassword}
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect={false}
          spellCheck={false}
          textContentType="oneTimeCode"
          passwordRules="minlength: 6;"
          returnKeyType="done"
          onSubmitEditing={handleSubmit(onSubmit)}
          ref={confirmPasswordRef}
        />

        <CustomButton
          title={
            isLoading || isSubmitting
              ? "Preparing verification..."
              : "Continue to Verify Age"
          }
          variant="secondary"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading || isSubmitting}
          disabled={isLoading || isSubmitting}
          style={styles.signupButton}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/(auth)/Login" asChild>
          <TouchableOpacity>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </AuthLayout>
  );
}
