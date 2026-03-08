import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { theme } from "../../constants/themes";
import TagChip from "../feed/TagChip";

function normalizeTag(input) {
  let t = String(input || "").trim().toLowerCase();
  if (t.startsWith("#")) t = t.slice(1);
  t = t.replace(/[^a-z0-9_]/g, "");
  if (t.length > 30) t = t.slice(0, 30);
  return t;
}

export default function TagSelector({
  title = "Select up to 3 tags",
  tags = [],
  selectedTags = [],
  maxSelected = 3,
  onToggleTag,
  onAddCustomTag,
}) {
  const [customTag, setCustomTag] = useState("");
  const canAddCustom = typeof onAddCustomTag === "function";
  const helper = useMemo(() => "letters/numbers/_ only", []);

  const handleAdd = () => {
    const cleaned = normalizeTag(customTag);
    if (!cleaned) return;
    onAddCustomTag?.(cleaned);
    setCustomTag("");
  };

  return (
    <View>
      <Text style={styles.title}>{title}</Text>

      {canAddCustom ? (
        <View style={styles.addRow}>
          <TextInput
            value={customTag}
            onChangeText={setCustomTag}
            placeholder="Add a new tag"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={30}
            style={styles.addInput}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAdd} activeOpacity={0.85}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagsScroll}
        contentContainerStyle={styles.tagsContainer}
      >
        {tags.map((tag) => (
          <TagChip
            key={tag}
            tag={tag}
            selected={selectedTags.includes(tag)}
            onPress={() => onToggleTag?.(tag)}
          />
        ))}
      </ScrollView>
      <Text style={styles.count}>
        {selectedTags.length}/{maxSelected} selected
      </Text>
      {canAddCustom ? <Text style={styles.helper}>Tag format: {helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontFamily: theme.fontFamily.bold,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    color: theme.colors.textDark,
  },
  tagsScroll: {
    marginHorizontal: -theme.spacing.lg,
  },
  tagsContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
    marginBottom: theme.spacing.md,
  },
  addInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textDark,
    fontFamily: theme.fontFamily.regular,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  addButtonText: {
    color: theme.colors.buttonText,
    fontFamily: theme.fontFamily.bold,
  },
  count: {
    textAlign: "center",
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
  },
  helper: {
    textAlign: "center",
    marginTop: 6,
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
  },
});
