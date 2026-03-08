import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./FilterModal.styles";

export default function FilterActions({ selectedCount = 0, onClear, onApply }) {
  const isEmpty = selectedCount === 0;

  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.clearButton, isEmpty && styles.clearButtonDisabled]}
        onPress={onClear}
        disabled={isEmpty}
        activeOpacity={0.8}
      >
        <Text style={styles.clearButtonText}>Clear All</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.applyButton}
        onPress={onApply}
        activeOpacity={0.8}
      >
        <Text style={styles.applyButtonText}>
          {selectedCount ? `Apply (${selectedCount})` : "Apply"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

