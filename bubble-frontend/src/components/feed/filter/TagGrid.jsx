import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/themes";
import { styles } from "./FilterModal.styles";

export default function TagGrid({
  tags = [],
  selectedTags = [],
  searchQuery = "",
  onToggleTag,
}) {
  const title = searchQuery
    ? `Search Results (${tags.length})`
    : `All Tags (${tags.length})`;

  return (
    <View style={styles.tagsSection}>
      <Text style={styles.tagsSectionTitle}>{title}</Text>

      <ScrollView
        style={styles.tagListContainer}
        contentContainerStyle={styles.tagsGrid}
        showsVerticalScrollIndicator={false}
      >
        {tags.length ? (
          tags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.tagButton, isSelected && styles.tagButtonSelected]}
                onPress={() => onToggleTag?.(tag)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                  #{tag}
                </Text>
                {isSelected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={theme.colors.buttonText}
                    style={styles.checkIcon}
                  />
                ) : null}
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={48} color={theme.colors.muted} />
            <Text style={styles.noResults}>No tags found for "{searchQuery}"</Text>
            <Text style={styles.noResultsSubtitle}>Try a different search term</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

