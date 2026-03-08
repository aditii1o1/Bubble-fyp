import React, { useEffect, useMemo, useState } from "react";
import { Modal, View, Pressable } from "react-native";
import FilterModalHeader from "./FilterModalHeader";
import FilterSearchBar from "./FilterSearchBar";
import SelectedTagsBar from "./SelectedTagsBar";
import TagGrid from "./TagGrid";
import FilterActions from "./FilterActions";
import { styles } from "./FilterModal.styles";

export default function FilterModal({
  visible,
  tags = [],
  selectedTags = [],
  onApply,
  onClear,
  onClose,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelected, setLocalSelected] = useState(selectedTags);

  useEffect(() => {
    if (!visible) return;
    setSearchQuery("");
    setLocalSelected(selectedTags || []);
  }, [selectedTags, visible]);

  const filteredTags = useMemo(() => {
    const q = String(searchQuery || "").trim().toLowerCase();
    return tags
      .filter((t) => t !== "All")
      .filter((tag) => (q ? tag.toLowerCase().includes(q) : true));
  }, [searchQuery, tags]);

  const toggleTag = (tag) => {
    setLocalSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClear = () => {
    setLocalSelected([]);
    onClear?.();
  };

  const handleApply = () => {
    onApply?.({ tags: localSelected });
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />

      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <FilterModalHeader title="Filter by Tags" onClose={onClose} />

          <FilterSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />

          <SelectedTagsBar
            selectedTags={localSelected}
            onRemoveTag={toggleTag}
          />

          <TagGrid
            tags={filteredTags}
            selectedTags={localSelected}
            searchQuery={searchQuery}
            onToggleTag={toggleTag}
          />

          <FilterActions
            selectedCount={localSelected.length}
            onClear={handleClear}
            onApply={handleApply}
          />
        </View>
      </View>
    </Modal>
  );
}

