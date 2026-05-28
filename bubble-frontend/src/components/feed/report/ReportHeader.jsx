import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/themes";
import { styles } from "./ReportModal.styles";

const TYPE_LABELS = {
  post: "Bubble",
  comment: "Comment",
  profile: "Profile",
  support: "Support Request",
};

export default function ReportHeader({ type, onClose }) {
  const label = TYPE_LABELS[type] || "Bubble";
  const subject = type === "support" ? "request" : type || "bubble";
  const title = type === "support" ? "Support Request" : `Report ${label}`;

  return (
    <View style={styles.header}>
      <View style={styles.headerIcon}>
        <Ionicons name="warning" size={24} color={theme.colors.primaryPink} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        Help us understand what's wrong with this {subject}
      </Text>
      <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
        <Ionicons name="close" size={24} color={theme.colors.textDark} />
      </TouchableOpacity>
    </View>
  );
}

