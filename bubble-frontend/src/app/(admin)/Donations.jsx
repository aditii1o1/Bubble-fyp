import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { theme } from "../../constants/themes";
import { appActions, useAppContext } from "../../context/AppContext";
import { commonStyles } from "../../styles/commonStyles";
import { confirmAlert } from "../../utils/alertUtils";
import EmptyState from "../../components/common/EmptyState";
import ScreenHeader from "../../components/common/ScreenHeader";
import SearchBar from "../../components/common/SearchBar";
import DonationCard from "../../components/admin/DonationCard";
import { adminService } from "../../services/adminService";
import { authService } from "../../services/authService";

function formatAmountNpr(value) {
  if (!Number.isFinite(value)) return "NPR 0";
  const formatted = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2);
  return `NPR ${formatted}`;
}

function formatDateTime(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDonorName(donation) {
  return (
    donation?.donorName ||
    donation?.userNickname ||
    donation?.userUsername ||
    donation?.userEmail ||
    "Anonymous Supporter"
  );
}

export default function AdminDonationsScreen() {
  const { dispatch } = useAppContext();
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [donations, setDonations] = useState([]);

  const syncDonations = useCallback(async () => {
    const list = await adminService.getDonations({ pageSize: 200 });
    setDonations(Array.isArray(list) ? list : []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          await syncDonations();
        } catch {
          // ignore
        }
      })();
    }, [syncDonations])
  );

  const onRefresh = useCallback(() => {
    (async () => {
      try {
        setRefreshing(true);
        await syncDonations();
      } finally {
        setRefreshing(false);
      }
    })();
  }, [syncDonations]);

  const confirmLogout = useCallback(() => {
    confirmAlert({
      title: "Log out",
      message: "Are you sure you want to log out of admin?",
      confirmText: "Log out",
      confirmStyle: "destructive",
      onConfirm: () => {
        (async () => {
          try {
            dispatch(appActions.logout());
            await authService.logout();
          } finally {
            router.replace("/(auth)/Login");
          }
        })();
      },
    });
  }, [dispatch]);

  const filteredDonations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return donations;
    return donations.filter((d) => {
      return (
        String(d.donorName || "").toLowerCase().includes(q) ||
        String(d.userEmail || "").toLowerCase().includes(q) ||
        String(d.userNickname || "").toLowerCase().includes(q) ||
        String(d.userUsername || "").toLowerCase().includes(q) ||
        String(d.pidx || "").toLowerCase().includes(q) ||
        String(d.transactionId || "").toLowerCase().includes(q) ||
        String(d.status || "").toLowerCase().includes(q)
      );
    });
  }, [query, donations]);

  const totals = useMemo(() => {
    const completed = donations.filter(
      (d) => String(d.status || "").toLowerCase() === "completed"
    );
    const sum = completed.reduce((acc, d) => {
      const amount = Number.isFinite(d.totalAmount) ? d.totalAmount : d.amount;
      return acc + (Number.isFinite(amount) ? amount : 0);
    }, 0);
    return { count: completed.length, sum };
  }, [donations]);
  const isWeb = Platform.OS === "web";

  return (
    <SafeAreaView style={commonStyles.screen}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Donations"
        onBack={router.back}
        rightIcon="log-out-outline"
        onRightPress={confirmLogout}
        rightAccessibilityLabel="Log out"
      />

      <View style={styles.top}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search donations (email, payment id, status...)"
        />
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Completed donations</Text>
          <Text style={styles.summaryValue}>
            {totals.count} - {formatAmountNpr(totals.sum)}
          </Text>
        </View>
      </View>

      {isWeb ? (
        <ScrollView contentContainerStyle={styles.listContent}>
          {filteredDonations.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.cellName]}>Donor</Text>
                  <Text style={[styles.tableCell, styles.cellEmail]}>Email</Text>
                  <Text style={[styles.tableCell, styles.cellAmount]}>Amount</Text>
                  <Text style={[styles.tableCell, styles.cellDate]}>Date</Text>
                  <Text style={[styles.tableCell, styles.cellTxn]}>Transaction ID</Text>
                  <Text style={[styles.tableCell, styles.cellStatus]}>Status</Text>
                </View>

                {filteredDonations.map((donation) => {
                  const amountValue = Number.isFinite(donation?.totalAmount)
                    ? donation.totalAmount
                    : donation?.amount;

                  return (
                    <View key={donation.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.cellName]}>
                        {getDonorName(donation)}
                      </Text>
                      <Text style={[styles.tableCell, styles.cellEmail]}>
                        {donation.userEmail || "Unknown"}
                      </Text>
                      <Text style={[styles.tableCell, styles.cellAmount]}>
                        {formatAmountNpr(amountValue)}
                      </Text>
                      <Text style={[styles.tableCell, styles.cellDate]}>
                        {formatDateTime(donation.createdAt)}
                      </Text>
                      <Text style={[styles.tableCell, styles.cellTxn]}>
                        {donation.transactionId || donation.pidx || "-"}
                      </Text>
                      <Text style={[styles.tableCell, styles.cellStatus]}>
                        {donation.status || "Initiated"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <EmptyState
              icon="cash-outline"
              title="No donations yet"
              message="Completed Khalti donations will appear here after payment verification."
            />
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredDonations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => <DonationCard donation={item} />}
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
              icon="cash-outline"
              title="No donations yet"
              message="Completed Khalti donations will appear here after payment verification."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  summary: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  summaryTitle: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  summaryValue: {
    marginTop: 4,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  separator: {
    height: theme.spacing.md,
  },
  table: {
    minWidth: 940,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
  },
  tableHeader: {
    backgroundColor: theme.colors.accent,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  tableCell: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.text,
  },
  cellName: {
    width: 180,
  },
  cellEmail: {
    width: 230,
  },
  cellAmount: {
    width: 120,
  },
  cellDate: {
    width: 180,
  },
  cellTxn: {
    width: 190,
  },
  cellStatus: {
    width: 140,
  },
});
