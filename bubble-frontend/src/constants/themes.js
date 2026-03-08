// constants/themes.js
import { StyleSheet } from "react-native";

export const theme = {
  colors: {
    primary: "#FF8FAB",
    primaryPink: "#FF8FAB",
    secondary: "#FFC2D1",
    secondaryPink: "#FFC2D1",
    background: "#FFF9F5",
    bgWhite: "#FFFFFF",
    bgCream: "#FFF9F5",
    bgSoft: "#F5F5F5",
    bgMuted: "#F0F0F0",
    surface: "#FFFFFF",
    surface2: "#F5F5F5",
    text: "#333333",
    textDark: "#333333",
    muted: "#888888",
    textMuted: "#888888",
    textLight: "#B0B0B0",
    buttonText: "#FFFFFF",
    border: "#E0E0E0",
    borderLight: "#E0E0E0",
    borderSoft: "#F0F0F0",
    white: "#FFFFFF",
    accent: "#FFE8ED",
    warningOrange: "#FFA500",
    errorRed: "#FF4444",
    error: "#FF4444",
    successGreen: "#4CAF50",
    success: "#4CAF50",
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  fontFamily: {
    regular: "Lora_400Regular",
    bold: "Lora_700Bold",
    medium: "Lora_400Regular",
    semiBold: "Lora_700Bold",
  },

  fonts: {
    regular: "Lora_400Regular",
    bold: "Lora_700Bold",
    medium: "Lora_400Regular",
    semiBold: "Lora_700Bold",
  },

  typography: {
    fontFamily: {
      regular: "Lora_400Regular",
      bold: "Lora_700Bold",
      medium: "Lora_400Regular",
      semiBold: "Lora_700Bold",
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    round: 9999,
  },

  shadow: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },

  gradient: ["#FFF9F5", "#FFE8ED"],
};

export const makeStyles = (styles) => StyleSheet.create(styles);
export default theme;
