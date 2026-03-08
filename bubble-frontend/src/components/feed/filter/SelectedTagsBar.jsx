import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/themes";
import { styles } from "./FilterModal.styles";

export default function SelectedTagsBar({ selectedTags = [], onRemoveTag }) {
  if (!selectedTags.length) return null;

  return (
    <View style={styles.selectedTagsContainer}>
      <Text style={styles.selectedTagsTitle}>
        Selected ({selectedTags.length}):
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.selectedTagsScroll}
      >
        {selectedTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={styles.selectedTag}
            onPress={() => onRemoveTag?.(tag)}
            activeOpacity={0.8}
          >
            <Text style={styles.selectedTagText}>#{tag}</Text>
            <Ionicons
              name="close-circle"
              size={16}
              color={theme.colors.buttonText}
              style={styles.removeIcon}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

