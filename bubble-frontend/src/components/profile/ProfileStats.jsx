import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../constants/themes";

export default function ProfileStats({ items = [] }) {
  if (!items.length) return null;

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.lg,
  },
  item: {
    alignItems: "center",
    marginHorizontal: theme.spacing.lg,
  },
  value: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  label: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
});

