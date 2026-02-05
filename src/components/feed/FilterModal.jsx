// src/components/feed/FilterModal.jsx
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";

const filterSchema = z.object({
  tags: z.array(z.string()).default([]),
});

const FilterModal = ({
  visible,
  tags = [],
  selectedTags = [],
  onApply,
  onClear,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      tags: selectedTags,
    },
  });

  const currentTags = watch("tags");

  const filteredTags = tags
    .filter((t) => t !== "All")
    .filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

  // Handle tag toggle
  const handleTagToggle = (tag) => {
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    setValue("tags", newTags, { shouldValidate: true });
  };

  const handleClear = () => {
    reset({
      tags: [],
    });
    onClear?.();
  };

  const onSubmit = (data) => {
    onApply?.(data);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.overlay} onPress={onClose} />

      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header with title and close button */}
          <View style={styles.header}>
            <Text style={styles.title}>Filter by Tags</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={theme.colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Text style={styles.hashIcon}>#</Text>
            <TextInput
              placeholder="Search hashtags..."
              placeholderTextColor={theme.colors.muted}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={styles.clearSearch}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Selected Tags */}
          {currentTags.length > 0 && (
            <View style={styles.selectedTagsContainer}>
              <Text style={styles.selectedTagsTitle}>
                Selected ({currentTags.length}):
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.selectedTagsScroll}
              >
                {currentTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.selectedTag}
                    onPress={() => handleTagToggle(tag)}
                  >
                    <Text style={styles.selectedTagText}>#{tag}</Text>
                    <Ionicons
                      name="close-circle"
                      size={16}
                      color="#fff"
                      style={styles.removeIcon}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Tag List */}
          <View style={styles.tagsSection}>
            <Text style={styles.tagsSectionTitle}>
              {searchQuery
                ? `Search Results (${filteredTags.length})`
                : `All Tags (${filteredTags.length})`}
            </Text>
            <ScrollView
              style={styles.tagListContainer}
              contentContainerStyle={styles.tagsGrid}
              showsVerticalScrollIndicator={false}
            >
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => {
                  const isSelected = currentTags.includes(tag);

                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tagButton,
                        isSelected && styles.tagButtonSelected,
                      ]}
                      onPress={() => handleTagToggle(tag)}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          isSelected && styles.tagTextSelected,
                        ]}
                      >
                        #{tag}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={theme.colors.buttonText}
                          style={styles.checkIcon}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.noResultsContainer}>
                  <Ionicons
                    name="search-outline"
                    size={48}
                    color={theme.colors.muted}
                  />
                  <Text style={styles.noResults}>
                    No tags found for "{searchQuery}"
                  </Text>
                  <Text style={styles.noResultsSubtitle}>
                    Try a different search term
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.clearButton,
                currentTags.length === 0 && styles.clearButtonDisabled,
              ]}
              onPress={handleClear}
              disabled={currentTags.length === 0}
            >
              <Text
                style={[
                  styles.clearButtonText,
                  currentTags.length === 0 && styles.clearButtonTextDisabled,
                ]}
              >
                Clear All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.applyButtonText}>
                {currentTags.length > 0
                  ? `Apply (${currentTags.length})`
                  : "Apply"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    position: "absolute",
    top: "10%",
    left: 20,
    right: 20,
    maxHeight: "80%",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    maxHeight: "100%",
  },
  // Updated Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface2,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  hashIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.primary,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.regular,
  },
  clearSearch: {
    fontSize: 24,
    color: theme.colors.muted,
    padding: 4,
  },
  selectedTagsContainer: {
    marginBottom: 16,
  },
  selectedTagsTitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  selectedTagsScroll: {
    flexDirection: "row",
  },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },
  selectedTagText: {
    color: theme.colors.buttonText,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    marginRight: 6,
  },
  removeIcon: {
    marginLeft: 2,
  },
  tagsSection: {
    flex: 1,
    marginBottom: 20,
  },
  tagsSectionTitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    marginBottom: 12,
  },
  tagListContainer: {
    maxHeight: 200,
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 10,
  },
  tagButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tagText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
  },
  tagTextSelected: {
    color: theme.colors.buttonText,
  },
  checkIcon: {
    marginLeft: 6,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    width: "100%",
  },
  noResults: {
    color: theme.colors.muted,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 6,
  },
  noResultsSubtitle: {
    color: theme.colors.muted,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonDisabled: {
    opacity: 0.5,
  },
  clearButtonText: {
    color: theme.colors.muted,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
  },
  clearButtonTextDisabled: {
    color: theme.colors.muted,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: theme.colors.buttonText,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
});
