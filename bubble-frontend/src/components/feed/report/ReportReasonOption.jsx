import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./ReportModal.styles";

export default function ReportReasonOption({ reason, selected, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.reasonButton, selected && styles.reasonButtonSelected]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <Text style={[styles.reasonText, selected && styles.reasonTextSelected]}>
        {reason.label}
      </Text>
    </TouchableOpacity>
  );
}

