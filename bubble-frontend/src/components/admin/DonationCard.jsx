import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../constants/themes";
import { commonStyles } from "../../styles/commonStyles";
import { formatRelativeTime } from "../../utils/helpers";

function formatAmountNpr(value) {
  if (!Number.isFinite(value)) return "NPR 0";
  const formatted = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2);
  return `NPR ${formatted}`;
}

export default function DonationCard({ donation }) {
  const amountValue = Number.isFinite(donation?.totalAmount)
    ? donation.totalAmount
    : donation?.amount;
  const amountLabel = formatAmountNpr(amountValue);
  const status = donation?.status || "Initiated";
  const nickname =
    donation?.donorName ||
    donation?.userNickname ||
    donation?.userUsername ||
    donation?.userEmail ||
    "Guest";
  const email = donation?.userEmail || "Unknown email";
  const createdAt = donation?.createdAt ? formatRelativeTime(donation.createdAt) : "";
  const reference = donation?.transactionId || donation?.pidx || "";

  return (
    <View style={[commonStyles.card, styles.card]}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.nickname}>{nickname}</Text>
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
          <Text style={styles.meta} numberOfLines={2}>
            {createdAt ? `${createdAt} - ` : ""}
            {reference ? `Reference ${reference}` : "No payment id"}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount} numberOfLines={1}>
            {amountLabel}
          </Text>
          <View
            style={[
              styles.badge,
              status.toLowerCase() === "completed" && styles.badgeSuccess,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                status.toLowerCase() === "completed" && styles.badgeTextSuccess,
              ]}
              numberOfLines={1}
            >
              {status}
            </Text>
          </View>
          {donation?.demo ? <Text style={styles.demo}>Demo</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
    minWidth: 0,
    marginRight: theme.spacing.md,
  },
  nickname: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  email: {
    marginTop: 2,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.muted,
  },
  meta: {
    marginTop: 4,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  right: {
    alignItems: "flex-end",
    flexShrink: 0,
    maxWidth: 124,
  },
  amount: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  badge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.bgSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  badgeSuccess: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.primary,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.text,
  },
  badgeTextSuccess: {
    color: theme.colors.primary,
  },
  demo: {
    marginTop: 6,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.textMuted,
  },
});
