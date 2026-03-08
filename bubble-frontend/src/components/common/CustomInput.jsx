import React from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { theme } from "../../constants/themes";
import { styles } from "./CustomInput.styles";

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

export default CustomInput;
