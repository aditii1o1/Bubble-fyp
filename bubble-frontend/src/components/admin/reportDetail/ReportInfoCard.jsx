import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../../constants/themes";
import { commonStyles } from "../../../styles/commonStyles";
import { formatTimeAgo } from "../../../lib/utils";
import { getReportReasonLabel } from "../../../lib/reporting";

function MetaRow({ label, value }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

export default function ReportInfoCard({ report }) {
  return (
    <View style={[commonStyles.card, styles.card]}>
      <Text style={styles.title}>Report</Text>

      <MetaRow
        label="Type"
        value={report.targetType === "post" ? "Post" : "Comment"}
      />
      <MetaRow label="Reason" value={getReportReasonLabel(report.reason)} />
      <MetaRow label="Status" value={String(report.status)} />
      <MetaRow label="Created" value={formatTimeAgo(report.createdAt)} />

      {!!report.description && (
        <>
          <View style={styles.divider} />
          <Text style={styles.description}>{report.description}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xs,
  },
  metaLabel: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  metaValue: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.spacing.md,
  },
  description: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.muted,
  },
});

