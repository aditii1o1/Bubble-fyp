import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import ScreenHeader from "../components/common/ScreenHeader";
import { commonStyles } from "../styles/commonStyles";
import { theme } from "../constants/themes";

const SECTIONS = [
  {
    title: "What Bubble stores",
    body:
      "Your account email, profile details, posts, comments, reactions, reposts, donations, and in-app notifications are stored so the app can work properly.",
  },
  {
    title: "What other people can see",
    body:
      "Your nickname, avatar, bio, posts, reposts, and activity inside the app may be visible to other signed-in users. Private credentials like your password are never shown.",
  },
  {
    title: "How we use your data",
    body:
      "Bubble uses your data to sign you in, personalize your profile, show your content, support moderation, and deliver app features like donations and notifications.",
  },
  {
    title: "Your choices",
    body:
      "You can edit your profile, remove your own posts or reposts, and mark notifications as read. If something looks wrong, use Report a Problem so it can be reviewed.",
  },
  {
    title: "Safety and moderation",
    body:
      "Reports, moderation logs, and account restrictions may be used to investigate harmful content, abuse, spam, or policy violations inside the app.",
  },
];

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={commonStyles.screen}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader title="Privacy" onBack={router.back} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.card, styles.heroCard]}>
          <Text style={styles.heroTitle}>Your privacy in Bubble</Text>
          <Text style={styles.heroText}>
            Bubble keeps the data it needs to run the app, show your content, and keep the
            community safe. This screen summarizes the basics in simple language.
          </Text>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={[commonStyles.card, styles.sectionCard]}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={[commonStyles.card, styles.footerCard]}>
          <Text style={styles.footerTitle}>Need help?</Text>
          <Text style={styles.footerText}>
            If you want something corrected or want to report a privacy concern, open the
            Settings area and use Report a Problem.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  heroCard: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.accent,
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    fontSize: theme.fontSize.xl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  heroText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textLight,
    lineHeight: 22,
  },
  sectionCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionBody: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textLight,
    lineHeight: 22,
  },
  footerCard: {
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  footerTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textLight,
    lineHeight: 22,
  },
});
