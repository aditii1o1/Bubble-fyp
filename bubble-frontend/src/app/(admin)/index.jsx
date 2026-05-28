import React, { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { theme } from "../../constants/themes";
import { commonStyles } from "../../styles/commonStyles";
import { adminService } from "../../services/adminService";
import AdminActivityChart from "../../components/admin/AdminActivityChart";
import AdminProfileMenu from "../../components/admin/AdminProfileMenu";

function SummaryCard({ label, value, tone = theme.colors.primaryPink }) {
  return (
    <View style={[commonStyles.card, styles.summaryCard]}>
      <View style={[styles.summaryRule, { backgroundColor: tone }]} />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function QuickActionCard({ title, subtitle, onPress, accent = theme.colors.primaryPink }) {
  return (
    <TouchableOpacity
      style={[commonStyles.card, styles.actionCard]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.actionRule, { backgroundColor: accent }]} />
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
      <Text style={[styles.actionCta, { color: accent }]}>Open</Text>
    </TouchableOpacity>
  );
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    openReports: 0,
    resolvedReports: 0,
    users: 0,
    bannedUsers: 0,
    posts: 0,
    comments: 0,
    activity: [],
  });

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        try {
          const next = await adminService.getDashboardCounts();
          if (!alive) return;
          setCounts(next);
        } catch {
          // ignore
        }
      })();
      return () => {
        alive = false;
      };
    }, [])
  );

  const quickActions = useMemo(
    () => [
      {
        key: "reports",
        title: "Review Reports",
        subtitle: "Triage open moderation issues quickly.",
        route: "/(admin)/Reports",
        accent: theme.colors.primaryPink,
      },
      {
        key: "users",
        title: "Manage Users",
        subtitle: "See bios, roles, and account status at a glance.",
        route: "/(admin)/Users",
        accent: "#0EA5E9",
      },
      {
        key: "moderation",
        title: "Blocked Words",
        subtitle: "Tune moderation rules for new content.",
        route: "/(admin)/Moderation",
        accent: "#F59E0B",
      },
      {
        key: "notifications",
        title: "Broadcasts",
        subtitle: "Send in-app announcements to everyone.",
        route: "/(admin)/Notifications",
        accent: "#10B981",
      },
    ],
    []
  );

  return (
    <SafeAreaView style={commonStyles.screen}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Moderation dashboard</Text>
              <Text style={styles.heroSubtitle}>
                Track community health, review issues faster, and keep the platform safe.
              </Text>
            </View>
            <AdminProfileMenu />
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            label="Open Reports"
            value={counts.openReports}
            tone="#EF4444"
          />
          <SummaryCard
            label="Users"
            value={counts.users}
            tone="#0EA5E9"
          />
          <SummaryCard
            label="Posts"
            value={counts.posts}
            tone="#F59E0B"
          />
          <SummaryCard
            label="Comments"
            value={counts.comments}
            tone="#10B981"
          />
          <SummaryCard
            label="Resolved"
            value={counts.resolvedReports}
            tone="#8B5CF6"
          />
          <SummaryCard
            label="Banned Users"
            value={counts.bannedUsers}
            tone="#6B7280"
          />
        </View>

        <AdminActivityChart items={counts.activity} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            onPress={() => router.push("/(admin)/reports/Resolved")}
            activeOpacity={0.8}
          >
            <Text style={styles.sectionLink}>Resolved reports</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.key}
              title={action.title}
              subtitle={action.subtitle}
              accent={action.accent}
              onPress={() => router.push(action.route)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[commonStyles.card, styles.secondaryPanel]}
          onPress={() => router.push("/(admin)/Donations")}
          activeOpacity={0.85}
        >
          <View style={styles.secondaryPanelBody}>
            <Text style={styles.secondaryPanelTitle}>Donations Overview</Text>
            <Text style={styles.secondaryPanelText}>
              Review donations, payment state, and donor history in one place.
            </Text>
          </View>
          <View style={styles.secondaryPanelCtaPill}>
            <Text style={styles.secondaryPanelCta}>Open</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  heroCard: {
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.small,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroTitle: {
    fontSize: theme.fontSize.xxxl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  heroSubtitle: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    lineHeight: 21,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textLight,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
  },
  summaryCard: {
    width: "48%",
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  summaryRule: {
    width: 34,
    height: 3,
    borderRadius: theme.borderRadius.round,
  },
  summaryValue: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.xxl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  summaryLabel: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  sectionHeader: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  sectionLink: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primaryPink,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    minHeight: 152,
  },
  actionRule: {
    width: 32,
    height: 3,
    borderRadius: theme.borderRadius.round,
  },
  actionTitle: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  actionSubtitle: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  actionCta: {
    marginTop: "auto",
    paddingTop: theme.spacing.md,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.bold,
  },
  secondaryPanel: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  secondaryPanelBody: {
    flex: 1,
    minWidth: 0,
  },
  secondaryPanelTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  secondaryPanelText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
    flexShrink: 1,
  },
  secondaryPanelCtaPill: {
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryPanelCta: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primaryPink,
  },
});
