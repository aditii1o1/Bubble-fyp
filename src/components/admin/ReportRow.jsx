import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../../constants/themes";

const ReportRow = ({ report, onResolve }) => {
  const reportId = report?.id || "unknown";
  const reason = report?.reason || "unspecified";
  const status = report?.status || "open";
  const targetType = report?.targetType || "post";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.idText}>#{reportId}</Text>
        <Text style={[styles.status, status === "resolved" && styles.resolved]}>
          {status}
        </Text>
      </View>

      <Text style={styles.line}>Target: {targetType}</Text>
      <Text style={styles.line}>Reason: {reason}</Text>

      {status !== "resolved" && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.keepButton]}
            onPress={() => onResolve?.(reportId, "keep")}
          >
            <Text style={styles.keepText}>Keep</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.removeButton]}
            onPress={() => onResolve?.(reportId, "remove")}
          >
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgWhite,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  idText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.textDark,
  },
  status: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.warningOrange,
    textTransform: "uppercase",
  },
  resolved: {
    color: theme.colors.successGreen,
  },
  line: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  button: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  keepButton: {
    backgroundColor: theme.colors.bgSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  removeButton: {
    backgroundColor: theme.colors.error + "15",
    borderWidth: 1,
    borderColor: theme.colors.error + "40",
  },
  keepText: {
    color: theme.colors.textDark,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
  },
  removeText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
  },
});

export default ReportRow;
