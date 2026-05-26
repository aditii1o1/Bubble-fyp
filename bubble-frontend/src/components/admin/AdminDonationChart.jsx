import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/themes";
import { commonStyles, withAlpha } from "../../styles/commonStyles";

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function addDays(date, days) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function formatDateKey(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function getDonationAmount(donation) {
  const totalAmount = Number(donation?.totalAmount);
  if (Number.isFinite(totalAmount)) return totalAmount;

  const amount = Number(donation?.amount);
  return Number.isFinite(amount) ? amount : 0;
}

function isCompletedDonation(donation) {
  return String(donation?.status || "").trim().toLowerCase() === "completed";
}

function formatNpr(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "NPR 0";
  return `NPR ${Math.round(amount).toLocaleString("en-US")}`;
}

export default function AdminDonationChart({ donations = [] }) {
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const startDate = addDays(today, -6);
    const rows = [];

    for (let index = 0; index < 7; index += 1) {
      const date = addDays(startDate, index);
      rows.push({
        date: formatDateKey(date),
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        amount: 0,
        count: 0,
      });
    }

    const rowsByDate = new Map(rows.map((row) => [row.date, row]));

    donations.forEach((donation) => {
      if (!isCompletedDonation(donation)) return;
      const createdAt = new Date(donation?.createdAt || "");
      if (Number.isNaN(createdAt.getTime())) return;

      const key = formatDateKey(createdAt);
      const row = rowsByDate.get(key);
      if (!row) return;

      row.amount += getDonationAmount(donation);
      row.count += 1;
    });

    const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);
    const totalCount = rows.reduce((sum, row) => sum + row.count, 0);
    const maxAmount = Math.max(1, ...rows.map((row) => row.amount));

    return { rows, totalAmount, totalCount, maxAmount };
  }, [donations]);

  if (!donations.length) {
    return (
      <View style={[commonStyles.card, styles.card]}>
        <Text style={styles.eyebrow}>Revenue</Text>
        <Text style={styles.title}>No donation data yet</Text>
        <Text style={styles.subtitle}>Completed Khalti donations will show up here.</Text>
      </View>
    );
  }

  return (
    <View style={[commonStyles.card, styles.card]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Revenue</Text>
          <Text style={styles.title}>Donation trend</Text>
          <Text style={styles.subtitle}>Completed donation amount over the last 7 days.</Text>
        </View>
        <View style={styles.metricPill}>
          <Text style={styles.metricValue}>{formatNpr(chartData.totalAmount)}</Text>
          <Text style={styles.metricLabel}>{chartData.totalCount} completed</Text>
        </View>
      </View>

      <View style={styles.chartRow}>
        {chartData.rows.map((item, index) => {
          const barHeight = Math.max(8, Math.round((item.amount / chartData.maxAmount) * 112));
          const isLast = index === chartData.rows.length - 1;

          return (
            <View key={item.date} style={styles.dayColumn}>
              <Text style={styles.barValue}>{item.count}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: barHeight,
                      backgroundColor: item.amount
                        ? isLast
                          ? theme.colors.primaryPink
                          : "#2563EB"
                        : withAlpha("#2563EB", "18"),
                    },
                  ]}
                />
              </View>
              <Text style={styles.dayLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.textMuted,
  },
  title: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  metricPill: {
    alignItems: "flex-end",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  metricValue: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  metricLabel: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
  },
  barValue: {
    marginBottom: theme.spacing.xs,
    fontSize: 10,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.textMuted,
  },
  barTrack: {
    width: 18,
    height: 120,
    justifyContent: "flex-end",
    backgroundColor: theme.colors.bgSoft,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: theme.borderRadius.lg,
  },
  dayLabel: {
    marginTop: theme.spacing.sm,
    fontSize: 11,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
});
