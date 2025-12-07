// src/components/common/CustomInput.jsx
import React, { memo, forwardRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { theme } from "../../constants/themes";

const CustomInput = memo(
  forwardRef(
    (
      {
        icon,
        iconType = "material",
        showPasswordToggle,
        isPasswordVisible,
        onTogglePassword,
        error,
        touched,
        secureTextEntry = false,
        ...textInputProps
      },
      ref
    ) => {
      const IconComponent = iconType === "material" ? MaterialIcons : Feather;
      const hasError = touched && error;
      const [isFocused, setIsFocused] = useState(false);

      // iOS-specific props to prevent password suggestion glitches
      const getIOSProps = () => {
        if (Platform.OS !== "ios") return {};

        if (secureTextEntry) {
          return {
            // These props disable iOS password autofill/suggestions
            textContentType: "oneTimeCode",
            autoComplete: "off",
            passwordRules: null,
          };
        }
        return {};
      };

      return (
        <View style={styles.container}>
          <View
            style={[
              styles.inputWrapper,
              hasError && styles.inputWrapperError,
              isFocused && styles.inputWrapperFocused,
            ]}
          >
            {icon && (
              <IconComponent
                name={icon}
                size={20}
                color={
                  hasError
                    ? theme.colors.error
                    : isFocused
                    ? theme.colors.primary
                    : theme.colors.iconGray
                }
                style={styles.icon}
              />
            )}
            <TextInput
              ref={ref}
              style={[
                styles.input,
                showPasswordToggle && styles.inputWithToggle,
              ]}
              placeholderTextColor={theme.colors.muted}
              secureTextEntry={secureTextEntry && !isPasswordVisible}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              {...getIOSProps()}
              {...textInputProps}
            />
            {showPasswordToggle && (
              <TouchableOpacity
                onPress={onTogglePassword}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather
                  name={isPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color={
                    hasError
                      ? theme.colors.error
                      : isFocused
                      ? theme.colors.primary
                      : theme.colors.iconGray
                  }
                  style={styles.toggleIcon}
                />
              </TouchableOpacity>
            )}
          </View>
          {hasError && (
            <View style={styles.errorContainer}>
              <Feather
                name="alert-circle"
                size={12}
                color={theme.colors.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      );
    }
  )
);

CustomInput.displayName = "CustomInput";

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    minHeight: 70,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    minHeight: 56,
  },
  inputWrapperError: {
    borderColor: theme.colors.error,
    backgroundColor: "#FFF5F5",
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: "#FFFFFF",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.fontFamily.regular,
    paddingVertical: 12,
    paddingHorizontal: 4,
    height: 44,
  },
  inputWithToggle: {
    flex: 1,
  },
  toggleIcon: {
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    fontFamily: theme.fontFamily.regular,
    marginLeft: 4,
  },
});

export default CustomInput;
