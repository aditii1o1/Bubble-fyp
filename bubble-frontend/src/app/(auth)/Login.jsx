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
import { getAuthErrorMessage } from "../../utils/authError";
import { useToast } from "../../context/ToastContext";
import { getAuthenticatedHref } from "../../utils/authRedirect";

function isEmailVerificationError(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("email not verified") || message.includes("verify your email");
}

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const submitLockRef = useRef(false);
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
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    if (submitLockRef.current) return;

    try {
      submitLockRef.current = true;
      setIsLoading(true);
      const email = String(data.email || "")
        .trim()
        .toLowerCase();
      const password = String(data.password || "");

      const result = await authService.login(email, password);
      const role = result?.profile?.role || "user";

      dispatch(appActions.setProfile(result.profile));
      dispatch(
        appActions.login(
          { email, uid: result?.user?.uid },
          role,
        ),
      );
      showToast("Signed in!", { type: "success" });
      router.replace(
        getAuthenticatedHref({
          role,
          onboarded: result?.profile?.onboarded,
        }),
      );
    } catch (error) {
      showToast(getAuthErrorMessage(error), { type: "error" });
      if (isEmailVerificationError(error)) {
        router.replace({
          pathname: "/(auth)/VerifyEmailSent",
          params: { email: String(data.email || "").trim().toLowerCase() },
        });
      }
    } finally {
      submitLockRef.current = false;
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
          loading={isLoading || isSubmitting}
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
