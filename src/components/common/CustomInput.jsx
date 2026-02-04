import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { theme } from "../../constants/themes";

const CustomInput = ({
  icon,
  iconType = "material",
  secureTextEntry,
  showPasswordToggle,
  isPasswordVisible,
  onTogglePassword,
  error,
  touched,
  ...props
}) => {
  const IconComponent = iconType === "feather" ? Feather : MaterialIcons;
  const hasError = touched && error;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, hasError && styles.containerError]}>
        {icon && (
          <View style={styles.iconContainer}>
            <IconComponent
              name={icon}
              size={20}
              color={hasError ? theme.colors.error : theme.colors.textMuted}
            />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            showPasswordToggle && styles.inputWithToggle,
          ]}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          placeholderTextColor={theme.colors.textMuted}
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={onTogglePassword}
          >
            <MaterialIcons
              name={isPasswordVisible ? "visibility-off" : "visibility"}
              size={20}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.lg,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.bgWhite,
  },
  containerError: {
    borderColor: theme.colors.error || "#ef4444",
  },
  iconContainer: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textDark,
    fontFamily: theme.fontFamily.regular,
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  inputWithIcon: {
    paddingLeft: 44,
  },
  inputWithToggle: {
    paddingRight: 44,
  },
  toggleButton: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error || "#ef4444",
    fontFamily: theme.fontFamily.regular,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default CustomInput;
