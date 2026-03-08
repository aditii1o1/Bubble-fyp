import React, { useCallback, useMemo, useState } from "react";
import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { theme } from "../../../constants/themes";
import { useAppContext } from "../../../context/AppContext";
import { commonStyles } from "../../../styles/commonStyles";
import { confirmAlert } from "../../../utils/alertUtils";
import EmptyState from "../../../components/common/EmptyState";
import ScreenHeader from "../../../components/common/ScreenHeader";
import SearchBar from "../../../components/common/SearchBar";
import ReportCard from "../../../components/admin/ReportCard";
import { adminService } from "../../../services/adminService";
import { authService } from "../../../services/authService";

function reportMatchesQuery(report, q, reporter, reportedUser) {
  if (!q) return true;
  const haystack = [
    report.id,
    report.targetType,
    report.targetId,
    report.reason,
    report.description,
    report.status,
    reporter?.nickname,
    reporter?.email,
    reportedUser?.nickname,
    reportedUser?.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export default function ResolvedReportsScreen() {
  const { state } = useAppContext();
  const [query, setQuery] = useState("");
  const [reports, setReports] = useState([]);

  const sync = useCallback(async () => {
    const resolved = await adminService.getReports({ status: "resolved", pageSize: 120 });
    const deleted = await adminService.getReports({ status: "deleted", pageSize: 120 });
    setReports([...resolved, ...deleted].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))));
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        await sync();
      } catch {
        // ignore
      }
    })();
  }, [sync]);

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

  const { filteredReports, counts } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const history = reports.filter((r) => r.status !== "open");

    const filtered = history.filter((r) => {
      return reportMatchesQuery(
        r,
        q,
        { nickname: r.reporterNickname, email: r.reporterEmail },
        { nickname: r.reportedUserNickname, email: r.reportedUserId }
      );
    });

    return {
      filteredReports: filtered,
      counts: {
        resolved: history.filter((r) => r.status === "resolved").length,
        deleted: history.filter((r) => r.status === "deleted").length,
      },
    };
  }, [query, reports]);

  const openReport = (reportId) => {
    router.push({ pathname: "/(admin)/ReportDetail", params: { reportId } });
  };

  return (
    <SafeAreaView style={commonStyles.screen}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Resolved Reports"
        onBack={router.back}
        rightIcon="log-out-outline"
        onRightPress={confirmLogout}
        rightAccessibilityLabel="Log out"
      />

      <View style={styles.top}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search history (user, reason, id...)"
        />
        <Text style={[commonStyles.helperText, styles.helper]}>
          History: {counts.resolved} resolved • {counts.deleted} deleted • {state.user?.email}
        </Text>
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const metaLine = `Reported: ${
            item.reportedUserNickname || item.reportedUserId
          } • By: ${item.reporterNickname || item.reporterId}`;

          return (
            <ReportCard
              report={item}
              onPress={() => openReport(item.id)}
              metaLine={metaLine}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No matches"
            message="Try a different search."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: {
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
