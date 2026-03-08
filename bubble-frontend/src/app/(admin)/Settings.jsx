import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { theme } from "../../constants/themes";
import { commonStyles } from "../../styles/commonStyles";
import ScreenHeader from "../../components/common/ScreenHeader";

export default function AdminSettingsScreen() {
  return (
    <SafeAreaView style={commonStyles.screen}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader title="Admin Settings" onBack={router.back} />

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(admin)/Moderation")}
          activeOpacity={0.85}
        >
          <Text style={styles.cardTitle}>Restricted Words</Text>
          <Text style={styles.cardSubtitle}>Manage the profanity/blocked words list</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(admin)/Notifications")}
          activeOpacity={0.85}
        >
          <Text style={styles.cardTitle}>Send Notifications</Text>
          <Text style={styles.cardSubtitle}>Send broadcast in-app notifications + view history</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.bgWhite,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  cardSubtitle: {
    marginTop: 6,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
});
