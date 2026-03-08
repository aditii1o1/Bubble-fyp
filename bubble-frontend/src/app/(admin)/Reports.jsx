import React, { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { theme } from "../../constants/themes";
import { useAppContext } from "../../context/AppContext";
import { commonStyles } from "../../styles/commonStyles";
import { confirmAlert } from "../../utils/alertUtils";
import EmptyState from "../../components/common/EmptyState";
import ScreenHeader from "../../components/common/ScreenHeader";
import SearchBar from "../../components/common/SearchBar";
import ReportCard from "../../components/admin/ReportCard";
import { adminService } from "../../services/adminService";
import { authService } from "../../services/authService";

export default function AdminReportsScreen() {
  const { state } = useAppContext();

  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState([]);

  const syncReports = useCallback(async () => {
    const open = await adminService.getReports({ status: "open", pageSize: 80 });
    setReports(open);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        try {
          await syncReports();
        } finally {
          // ignore
        }
      })();
      return () => {
        alive = false;
      };
    }, [syncReports])
  );

  const onRefresh = useCallback(() => {
    (async () => {
      try {
        setRefreshing(true);
        await syncReports();
      } finally {
        setRefreshing(false);
      }
    })();
  }, [syncReports]);

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

  const openReports = useMemo(
    () => reports.filter((r) => r.status === "open"),
    [reports]
  );

  const filteredReports = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return openReports;

    return openReports.filter((r) => {
      const haystack = [
        r.id,
        r.targetType,
        r.targetId,
        r.reason,
        r.description,
        r.reporterNickname,
        r.reporterEmail,
        r.reportedUserNickname,
        r.reportedUserId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [openReports, query]);

  const openReport = (reportId) => {
    router.push({ pathname: "/(admin)/ReportDetail", params: { reportId } });
  };

  return (
    <SafeAreaView style={commonStyles.screen}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Reports"
        onBack={router.back}
        rightIcon="log-out-outline"
        onRightPress={confirmLogout}
        rightAccessibilityLabel="Log out"
      />

      <View style={styles.searchWrap}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search open reports (user, reason, id...)"
          rightAction={{
            label: "History",
            onPress: () => router.push("/(admin)/reports/Resolved"),
          }}
        />
        <Text style={[commonStyles.helperText, styles.helper]}>
          Open reports: {openReports.length} • {state.user?.email}
        </Text>
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <ReportCard report={item} onPress={() => openReport(item.id)} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-circle-outline"
            title="No reports"
            message="Everything looks quiet."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    paddingHorizontal: theme.spacing.lg,
  },
  helper: {
    marginTop: theme.spacing.sm,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  separator: {
    height: theme.spacing.md,
  },
});
