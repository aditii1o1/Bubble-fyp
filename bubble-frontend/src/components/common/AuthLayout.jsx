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
        <View style={styles.background}>
          <View pointerEvents="none" style={styles.topWash} />
          <View pointerEvents="none" style={styles.bottomWash} />
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

AuthLayout.displayName = "AuthLayout";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
  },
  topWash: {
    position: "absolute",
    top: -90,
    right: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#FFE8ED",
    opacity: 0.7,
  },
  bottomWash: {
    position: "absolute",
    bottom: -120,
    left: -110,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#FFF1E7",
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});

export default AuthLayout;
