// app/(auth)/Login.jsx
import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "../../components/common/AuthLayout";
import ControlledInput from "../../components/common/ControlledInput";
import CustomButton from "../../components/common/CustomButton";
import { loginSchema } from "../../utils/validationSchemas";
import { appActions, useAppContext } from "../../context/AppContext";
import { styles } from "../../screens/auth/Login.styles";
import { authService } from "../../services/authService";
import { isAdminEmail } from "../../config/admin";
import { getAuthErrorMessage } from "../../utils/authError";
import { useToast } from "../../context/ToastContext";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const passwordRef = useRef(null);
  const { dispatch } = useAppContext();
  const { showToast } = useToast();

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
    try {
      setIsLoading(true);
      const email = String(data.email || "")
        .trim()
        .toLowerCase();
      const password = String(data.password || "");

      const result = await authService.login(email, password);

      dispatch(
        appActions.login(
          { email, uid: result?.user?.uid },
          isAdminEmail(email) ? "admin" : "user",
        ),
      );
      dispatch(appActions.setProfile(result.profile));

      if (isAdminEmail(email)) {
        showToast("Welcome Admin!", { type: "success" });
        router.replace("/(admin)");
        return;
      }

      showToast("Signed in!", { type: "success" });
      router.replace("/(tabs)/Home");
    } catch (error) {
      showToast(getAuthErrorMessage(error), { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <AuthLayout>
      <View style={styles.header}>
        <Text style={styles.title}>Bubble</Text>
        <Text style={styles.subtitle}>Welcome back!</Text>
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

        <Link href="/(auth)/ForgotPassword" asChild>
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </Link>

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
