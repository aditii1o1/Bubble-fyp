import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { theme } from "../../constants/themes";
import { getReports, resolveReport } from "../../services/adminService";
import ReportRow from "../../components/admin/ReportRow";

const normalizeReports = (payload) => {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.reports)
    ? payload.reports
    : [];

  return list.map((item, index) => ({
    id: item?.id || `report_${index}`,
    reason: item?.reason || "unspecified",
    status: item?.status || "open",
    targetType: item?.targetType || "post",
  }));
};

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async ({ isRefresh = false } = {}) => {
    if (!isRefresh) setIsLoading(true);
    try {
      const response = await getReports({ status: "open" });
      setReports(normalizeReports(response));
    } catch (error) {
      if (__DEV__) {
        console.log("Failed to fetch admin reports:", error);
      }
      if (!isRefresh) {
        setReports([]);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports({ isRefresh: true });
  };

  const onResolve = async (reportId, action) => {
    try {
      await resolveReport({ reportId, action });
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, status: "resolved" } : report
        )
      );
    } catch (error) {
      Alert.alert("Action Failed", error?.message || "Please try again.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primaryPink} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Open reports: {reports.length}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primaryPink]}
          />
        }
      >
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No open reports</Text>
            <Text style={styles.emptyText}>Everything looks clean for now.</Text>
          </View>
        ) : (
          reports.map((report) => (
            <ReportRow key={report.id} report={report} onResolve={onResolve} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgCream,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bgCream,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    backgroundColor: theme.colors.bgWhite,
  },
  title: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textDark,
    fontFamily: theme.fontFamily.bold,
  },
  subtitle: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.fontFamily.regular,
  },
  content: {
    padding: theme.spacing.lg,
  },
  emptyState: {
    paddingVertical: theme.spacing.xxl,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.textDark,
  },
  emptyText: {
    marginTop: 6,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.fontFamily.regular,
  },
});
