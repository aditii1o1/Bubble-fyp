import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";
import { commonStyles } from "../../styles/commonStyles";
import { useToast } from "../../context/ToastContext";

const SettingsItem = ({ icon, label, color, onPress }) => (
  <TouchableOpacity
    style={[commonStyles.card, styles.item]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.itemLeft}>
      <Ionicons name={icon} size={20} color={color || theme.colors.text} />
      <Text style={[styles.itemText, color && { color }]}>{label}</Text>
    </View>
    <Ionicons
      name="chevron-forward"
      size={20}
      color={color || theme.colors.muted}
    />
  </TouchableOpacity>
);

export default function ProfileSettingsSection({
  onReportProblem,
  onLogout,
}) {
  const { showToast } = useToast();

  const comingSoon = () =>
    showToast("Coming soon (not added yet).", { type: "info" });

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Settings</Text>

      <SettingsItem icon="notifications-outline" label="Notifications" onPress={comingSoon} />
      <SettingsItem icon="shield-outline" label="Privacy" onPress={comingSoon} />
      <SettingsItem icon="help-circle-outline" label="Help & Support" onPress={comingSoon} />
      <SettingsItem icon="flag-outline" label="Report a Problem" onPress={onReportProblem} />
      <SettingsItem
        icon="log-out-outline"
        label="Log Out"
        color={theme.colors.error}
        onPress={onLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  item: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  itemText: {
    marginLeft: theme.spacing.md,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
  },
});
