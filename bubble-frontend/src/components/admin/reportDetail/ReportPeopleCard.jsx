import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../../constants/themes";
import { commonStyles } from "../../../styles/commonStyles";
import { getAvatarEmoji } from "../../../lib/avatars";

function PersonRow({ title, user, fallbackId, subLine }) {
  return (
    <View style={styles.personRow}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarEmoji}>
          {getAvatarEmoji(user?.avatar || "default")}
        </Text>
      </View>
      <View style={styles.personText}>
        <Text style={styles.personTitle}>{title}</Text>
        <Text style={styles.personValue}>{user?.nickname || fallbackId}</Text>
        {subLine ? <Text style={styles.personSubValue}>{subLine}</Text> : null}
      </View>
    </View>
  );
}

export default function ReportPeopleCard({ report, reporter, reportedUser }) {
  return (
    <View style={[commonStyles.card, styles.card]}>
      <Text style={styles.title}>People</Text>

      <PersonRow
        title="Reporter"
        user={reporter}
        fallbackId={report.reporterId}
      />
      <PersonRow
        title="Reported User"
        user={reportedUser}
        fallbackId={report.reportedUserId}
        subLine={
          reportedUser ? `Status: ${reportedUser.isBanned ? "banned" : "active"}` : null
        }
      />
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
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  personText: {
    flex: 1,
  },
  personTitle: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  personValue: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginTop: 2,
  },
  personSubValue: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.muted,
    marginTop: 2,
  },
});
