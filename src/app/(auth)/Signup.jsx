// app/(auth)/Signup.jsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import {
  useFonts,
  Lora_400Regular,
  Lora_700Bold,
} from "@expo-google-fonts/lora";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { theme } from "../../constants/themes";
import AuthLayout from "../../components/common/AuthLayout";
import ControlledInput from "../../components/common/ControlledInput";
import CustomButton from "../../components/common/CustomButton";
import { signupSchema } from "../../utils/validationSchemas";

export default function SignupScreen() {
  const [fontsLoaded] = useFonts({ Lora_400Regular, Lora_700Bold });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nickname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur", // Changed from onChange for better UX
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    console.log("Signup attempt with:", data.email);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Success",
        `Account created for ${data.nickname}!\nEmail: ${data.email}`,
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/Home"),
          },
        ]
      );
    }, 1500);
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <AuthLayout scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the Bubble</Text>
      </View>

      <View style={styles.form}>
        <ControlledInput
          control={control}
          name="nickname"
          icon="person"
          iconType="material"
          placeholder="Choose a nickname"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          textContentType="none"
          importantForAutofill="no"
          returnKeyType="next"
          onSubmitEditing={() => setFocus("email")}
          blurOnSubmit={false}
        />

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
            isLoading || isSubmitting ? "Creating Account..." : "Create Account"
          }
          variant="secondary"
          onPress={handleSubmit(onSubmit)}
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
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
