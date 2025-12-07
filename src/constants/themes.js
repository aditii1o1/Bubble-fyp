// src/constants/theme.js
// ✅ FINAL VERSION - Complete theme configuration
export const theme = {
  colors: {
    primary: "#1E88E5",
    secondary: "#F50057",
    background: "#FFFFFF",
    text: "#212121",
    muted: "#9E9E9E",
    inputBackground: "#F5F5F5",
    inputBorder: "#E0E0E0",
    white: "#FFFFFF",
    iconGray: "#9E9E9E",
    error: "#F44336",
    success: "#4CAF50",
    warning: "#FF9800",
    info: "#2196F3",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  gradient: ["#FFDEE9", "#B5FFFC"],
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 36,
  },
  fontFamily: {
    regular: "Lora_400Regular",
    bold: "Lora_700Bold",
  },
  shadow: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};
