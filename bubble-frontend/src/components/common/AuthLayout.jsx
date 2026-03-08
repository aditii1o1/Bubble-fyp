// components/common/AuthLayout.jsx
import React, { memo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../constants/themes";
import DismissKeyboard from "./DismissKeyboard";

const AuthLayout = memo(({ children, scrollable = false }) => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        <LinearGradient colors={theme.gradient} style={styles.gradient}>
          {scrollable ? (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={
                Platform.OS === "ios" ? "interactive" : "on-drag"
              }
              showsVerticalScrollIndicator={false}
            >
              <DismissKeyboard style={styles.content}>
                {children}
              </DismissKeyboard>
            </ScrollView>
          ) : (
            <DismissKeyboard style={styles.content}>
              {children}
            </DismissKeyboard>
          )}
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

AuthLayout.displayName = "AuthLayout";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AuthLayout;
