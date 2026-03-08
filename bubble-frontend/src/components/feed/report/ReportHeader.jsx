import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/themes";
import { styles } from "./ReportModal.styles";

export default function ReportHeader({ type, onClose }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerIcon}>
        <Ionicons name="warning" size={24} color={theme.colors.primaryPink} />
      </View>
      <Text style={styles.title}>Report {type === "post" ? "Bubble" : "Comment"}</Text>
      <Text style={styles.subtitle}>
        Help us understand what's wrong with this {type}
      </Text>
      <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
        <Ionicons name="close" size={24} color={theme.colors.textDark} />
      </TouchableOpacity>
    </View>
  );
}

