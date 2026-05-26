import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/themes";
import { commonStyles, withAlpha } from "../../styles/commonStyles";

export default function AdminActivityChart({ items = [] }) {
  const chartMeta = useMemo(() => {
    const values = items.map((item) => Number(item?.users || 0));
    const total = values.reduce((sum, value) => sum + value, 0);
    const maxValue = Math.max(1, ...values);
    const latest = values[values.length - 1] || 0;
    const previous = values[values.length - 2] || 0;
    const delta = latest - previous;
    return { total, maxValue, delta };
  }, [items]);

  if (!items.length) {
    return (
      <View style={[commonStyles.card, styles.card]}>
        <Text style={styles.eyebrow}>Growth</Text>
        <Text style={styles.title}>No user growth data yet</Text>
        <Text style={styles.subtitle}>New signups will appear here once users join.</Text>
      </View>
    );
  }

  return (
    <View style={[commonStyles.card, styles.card]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Growth</Text>
          <Text style={styles.title}>User growth</Text>
          <Text style={styles.subtitle}>New accounts over the last 7 days.</Text>
        </View>
        <View style={styles.metricPill}>
          <Text style={styles.metricValue}>{chartMeta.total}</Text>
          <Text style={styles.metricLabel}>new users</Text>
        </View>
      </View>

      <View style={styles.chartRow}>
        {items.map((item, index) => {
          const value = Number(item?.users || 0);
          const barHeight = Math.max(8, Math.round((value / chartMeta.maxValue) * 112));
          const isLast = index === items.length - 1;

          return (
            <View key={item.date} style={styles.dayColumn}>
              <Text style={styles.barValue}>{value}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: barHeight,
                      backgroundColor: value
                        ? isLast
                          ? theme.colors.primaryPink
                          : "#0F766E"
                        : withAlpha("#0F766E", "18"),
                    },
                  ]}
                />
              </View>
              <Text style={styles.dayLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.footerNote}>
        {chartMeta.delta >= 0 ? "+" : ""}
        {chartMeta.delta} users versus the previous day
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
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
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  metricPill: {
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  metricValue: {
    fontSize: theme.fontSize.xl,
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
  footerNote: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
});
