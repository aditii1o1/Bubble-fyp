import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";
import { commonStyles } from "../../styles/commonStyles";
import { getReportReasonLabel } from "../../lib/reporting";
import { formatTimeAgo } from "../../lib/utils";
function getStatusColor(status) {
  if (status === "open") return theme.colors.warningOrange;
  if (status === "deleted") return theme.colors.error;
  return theme.colors.success;
}
export default function ReportCard({ report, onPress, metaLine }) {
  const statusColor = getStatusColor(report.status);
  return (
    <TouchableOpacity
      style={[commonStyles.card, styles.card]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.row}>
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {report.targetType === "post" ? "POST" : "COMMENT"}
            </Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </View>
      <Text style={styles.title}>{getReportReasonLabel(report.reason)} • {String(report.status).toUpperCase()}</Text>
      {metaLine ? (
        <Text style={styles.meta} numberOfLines={1}>
          {metaLine}
        </Text>
      ) : null}
      {!!report.description && (
        <Text style={styles.description} numberOfLines={2}>
          {report.description}
        </Text>
      )}
      <Text style={styles.time}>{formatTimeAgo(report.createdAt)}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.accent,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginLeft: theme.spacing.sm },
  title: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  meta: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  description: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.muted,
  },
  time: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
});
