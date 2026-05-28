import React, { useState } from "react";
import {
  Linking,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { theme } from "../constants/themes";
import { commonStyles } from "../styles/commonStyles";
import ScreenHeader from "../components/common/ScreenHeader";
import ReportModal from "../components/feed/ReportModal";
import { useAppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";

const SUPPORT_EMAIL = "support@bubble.app";

const FAQ_ITEMS = [
  {
    title: "I cannot post",
    body: "Check your connection, choose at least one tag, and make sure your text does not include restricted words.",
  },
  {
    title: "My profile photo is not showing",
    body: "Pull to refresh the feed after uploading. New and existing posts will use your latest profile photo.",
  },
  {
    title: "A payment did not complete",
    body: "Open the donation result screen again or contact support with your payment id if Khalti charged you.",
  },
];

function SupportAction({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity
      style={[commonStyles.card, styles.actionCard]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={20} color={theme.colors.primaryPink} />
      </View>
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function SupportScreen() {
  const { state } = useAppContext();
  const { showToast } = useToast();
  const [showReportModal, setShowReportModal] = useState(false);

  const openEmail = async () => {
    const subject = encodeURIComponent("Bubble support request");
    const body = encodeURIComponent(
      `Hi Bubble support,\n\n\nAccount: ${state.user?.email || "unknown"}`
    );
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        showToast(`Email us at ${SUPPORT_EMAIL}.`, { type: "info" });
        return;
      }
      await Linking.openURL(url);
    } catch {
      showToast(`Email us at ${SUPPORT_EMAIL}.`, { type: "info" });
    }
  };

  const submitReport = () => {
    setShowReportModal(false);
    showToast("Support request noted. Thank you for the details.", {
      type: "success",
    });
  };

  return (
    <SafeAreaView style={commonStyles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader title="Help & Support" onBack={router.back} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>How can we help?</Text>
        <Text style={styles.subtitle}>
          Find quick answers or send a support request from your account.
        </Text>

        <View style={styles.actions}>
          <SupportAction
            icon="mail-outline"
            title="Contact support"
            subtitle={SUPPORT_EMAIL}
            onPress={openEmail}
          />
          <SupportAction
            icon="flag-outline"
            title="Report a problem"
            subtitle="Share an issue for review"
            onPress={() => setShowReportModal(true)}
          />
        </View>

        <Text style={styles.sectionTitle}>Quick help</Text>
        {FAQ_ITEMS.map((item) => (
          <View key={item.title} style={[commonStyles.card, styles.faqCard]}>
            <Text style={styles.faqTitle}>{item.title}</Text>
            <Text style={styles.faqBody}>{item.body}</Text>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <ReportModal
          type="support"
          onClose={() => setShowReportModal(false)}
          onSubmit={submitReport}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    lineHeight: 21,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  actions: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  actionCard: {
    minHeight: 72,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accent,
  },
  actionText: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  actionTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  actionSubtitle: {
    marginTop: 3,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  faqCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  faqTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  faqBody: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
});
