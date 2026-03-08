import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { theme } from "../../../constants/themes";
import { styles } from "./FilterModal.styles";

export default function FilterSearchBar({ value, onChangeText, onClear }) {
  return (
    <View style={styles.searchContainer}>
      <Text style={styles.hashIcon}>#</Text>
      <TextInput
        placeholder="Search hashtags..."
        placeholderTextColor={theme.colors.muted}
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value?.length ? (
        <TouchableOpacity onPress={onClear} activeOpacity={0.8}>
          <Text style={styles.clearSearch}>×</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

