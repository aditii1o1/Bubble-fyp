import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";

const DonationBanner = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="heart-outline" size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Support Bubble</Text>
        <Text style={styles.subtitle}>
          Help keep our community ad-free and independent
        </Text>
      </View>
      <TouchableOpacity style={styles.button} activeOpacity={0.7}>
        <Text style={styles.buttonText}>Donate</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.muted,
    lineHeight: theme.typography.lineHeight.normal * 14,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    marginLeft: theme.spacing.md,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.buttonText,
  },
});

export default DonationBanner;
