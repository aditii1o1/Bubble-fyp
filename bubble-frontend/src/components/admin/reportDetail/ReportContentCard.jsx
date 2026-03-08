import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../../constants/themes";
import { commonStyles } from "../../../styles/commonStyles";

export default function ReportContentCard({ report, target }) {
  const label = report.targetType === "post" ? "Post" : "Comment";
  const body =
    target?.text || `This ${label.toLowerCase()} no longer exists.`;

  return (
    <View style={[commonStyles.card, styles.card]}>
      <Text style={styles.title}>Content</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.body}>{body}</Text>
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
  label: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  body: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
    lineHeight: 20,
  },
});

