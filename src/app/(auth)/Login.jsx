// app/(auth)/Login.jsx
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
import { theme } from "../../src/constants/themes";
import AuthLayout from "../../src/components/common/AuthLayout"; // Import AuthLayout
import ControlledInput from "../../src/components/common/ControlledInput";
import CustomButton from "../../src/components/common/CustomButton";
import { loginSchema } from "../../src/utils/validationSchemas";

export default function LoginScreen() {
  const [fontsLoaded] = useFonts({ Lora_400Regular, Lora_700Bold });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const passwordRef = useRef(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    setFocus,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    console.log("Login attempt with:", data.email);

    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Success", `Logged in as ${data.email}`, [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/Home"),
        },
      ]);
    }, 1500);
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    // Use AuthLayout wrapper for gradient background
    <AuthLayout>
      <Text style={styles.title}>Bubble</Text>
      <Text style={styles.subtitle}>Welcome back!</Text>

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
          returnKeyType="next"
          onSubmitEditing={() => setFocus("password")}
          blurOnSubmit={false}
        />

        <ControlledInput
          control={control}
          name="password"
          icon="lock"
          iconType="feather"
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          showPasswordToggle
          isPasswordVisible={showPassword}
          onTogglePassword={togglePassword}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          ref={passwordRef}
          returnKeyType="done"
          onSubmitEditing={handleSubmit(onSubmit)}
        />

        <TouchableOpacity style={styles.forgotButton}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <CustomButton
          title={isLoading || isSubmitting ? "Signing In..." : "Sign In"}
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading || isSubmitting}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Link href="/(auth)/Signup" asChild>
          <TouchableOpacity>
            <Text style={styles.signupLink}>Sign Up</Text>
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
  title: {
    fontSize: theme.fontSize.xxxl,
    fontFamily: "Lora_700Bold",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    fontFamily: "Lora_400Regular",
    color: theme.colors.muted,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.lg,
  },
  forgotText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontFamily: "Lora_400Regular",
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
  signupLink: {
    fontSize: theme.fontSize.sm,
    fontFamily: "Lora_700Bold",
    color: theme.colors.secondary,
  },
});
