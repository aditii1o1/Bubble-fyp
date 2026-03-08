import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { theme } from "../../constants/themes";
import { useAppContext } from "../../context/AppContext";
import { commonStyles } from "../../styles/commonStyles";
import { confirmAlert } from "../../utils/alertUtils";
import { authService } from "../../services/authService";
import { adminService } from "../../services/adminService";

export default function AdminDashboard() {
  const { state } = useAppContext();
  const [counts, setCounts] = useState({
    openReports: 0,
    users: 0,
    posts: 0,
    comments: 0,
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

  const confirmLogout = useCallback(() => {
    confirmAlert({
      title: "Log out",
      message: "Are you sure you want to log out of admin?",
      confirmText: "Log out",
      confirmStyle: "destructive",
      onConfirm: () => {
        (async () => {
          try {
            await authService.logout();
          } finally {
            router.replace("/(auth)/Login");
          }
        })();
      },
    });
  }, []);

  return (
    <SafeAreaView style={commonStyles.screenPadded}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.title}>Admin Panel</Text>
          <TouchableOpacity
            style={commonStyles.iconButton}
            onPress={confirmLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Moderation dashboard • {state.user?.email}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[commonStyles.card, styles.statCard]}>
          <Text style={styles.statValue}>{counts.openReports}</Text>
          <Text style={styles.statLabel}>Open Reports</Text>
        </View>
        <View style={styles.rowSpacer} />
        <View style={[commonStyles.card, styles.statCard]}>
          <Text style={styles.statValue}>{counts.users}</Text>
          <Text style={styles.statLabel}>Users</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[commonStyles.card, styles.statCard]}>
          <Text style={styles.statValue}>{counts.posts}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.rowSpacer} />
        <View style={[commonStyles.card, styles.statCard]}>
          <Text style={styles.statValue}>{counts.comments}</Text>
          <Text style={styles.statLabel}>Comments</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/(admin)/Reports")}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>View Reports</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/(admin)/reports/Resolved")}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>Resolved Reports</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/(admin)/Users")}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>Manage Users</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/(admin)/Moderation")}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>Restricted Words</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/(admin)/Notifications")}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>Send Notifications</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.muted,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  rowSpacer: {
    width: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  statLabel: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.muted,
  },
  primaryButton: {
    marginTop: theme.spacing.lg,
    height: 50,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.small,
  },
  primaryButtonText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.white,
  },
  secondaryButton: {
    marginTop: theme.spacing.md,
    height: 50,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
});
