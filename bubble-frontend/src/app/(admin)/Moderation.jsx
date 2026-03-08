import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";
import { commonStyles } from "../../styles/commonStyles";
import ScreenHeader from "../../components/common/ScreenHeader";
import { useToast } from "../../context/ToastContext";
import { confirmAlert } from "../../utils/alertUtils";
import { api } from "../../services/apiClient";

function parseWords(input) {
  // Support one-per-line or comma-separated; keep spaces inside phrases.
  return String(input || "")
    .split(/[\n,]+/g)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 200);
}

export default function AdminModerationScreen() {
  const { showToast } = useToast();
  const [blockedWords, setBlockedWords] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [showBulkEditor, setShowBulkEditor] = useState(false);
  const [showBlockedList, setShowBlockedList] = useState(false);
  const [showAllBlocked, setShowAllBlocked] = useState(false);
  const [blockedQuery, setBlockedQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/admin/moderation");
        const words = res.data?.blockedWords || [];
        if (!alive) return;
        const w = (Array.isArray(words) ? words : []).map((x) => String(x || "").trim().toLowerCase()).filter(Boolean);
        setBlockedWords(w);
        setBulkText(w.join("\n"));
      } catch (e) {
        if (alive) showToast(e?.message || "Could not load blocked words.", { type: "error" });
      }
    })();
    return () => {
      alive = false;
    };
  }, [showToast]);

  const allWords = useMemo(() => blockedWords, [blockedWords]);

  const previewWords = useMemo(() => allWords.slice(0, 12), [allWords]);
  const visibleWords = showAllBlocked ? allWords : previewWords;

  const filteredWords = useMemo(() => {
    if (!showBlockedList) return [];
    const q = String(blockedQuery || "").trim().toLowerCase();
    if (!q) return visibleWords;
    return visibleWords.filter((w) => String(w || "").toLowerCase().includes(q));
  }, [blockedQuery, showBlockedList, visibleWords]);

  const addWord = useCallback(() => {
    const additions = parseWords(newWord);
    if (!additions.length) return;
    setBlockedWords((prev) => {
      const next = Array.from(new Set([...(prev || []), ...additions])).slice(0, 200);
      return next;
    });
    setNewWord("");
  }, [newWord]);

  const removeWord = useCallback((word) => {
    const w = String(word || "").trim().toLowerCase();
    if (!w) return;
    confirmAlert({
      title: "Remove word?",
      message: `Remove "${w}" from the blocked list?`,
      confirmText: "Remove",
      confirmStyle: "destructive",
      onConfirm: () => {
        setBlockedWords((prev) => (prev || []).filter((x) => x !== w));
      },
    });
  }, []);

  const applyBulk = useCallback(() => {
    const next = parseWords(bulkText);
    setBlockedWords(next);
    showToast(`Loaded ${next.length} words from bulk edit.`, { type: "info" });
  }, [bulkText, showToast]);

  const saveBlockedWords = useCallback(() => {
    const words = (Array.isArray(blockedWords) ? blockedWords : []).slice(0, 200);

    confirmAlert({
      title: "Save blocked words?",
      message: `This will block posts/comments/user bios/usernames that include any of these words.\n\nTotal: ${words.length}`,
      confirmText: "Save",
      onConfirm: () => {
        (async () => {
          try {
            setIsSaving(true);
            await api.put("/admin/moderation", { blockedWords: words });
            setBulkText(words.join("\n"));
            setBlockedQuery("");
            setShowAllBlocked(false);
            setShowBlockedList(false);
            showToast("Blocked words saved.", { type: "success" });
          } catch (e) {
            showToast(e?.message || "Could not save blocked words.", { type: "error" });
          } finally {
            setIsSaving(false);
          }
        })();
      },
    });
  }, [blockedWords, showToast]);

  return (
    <SafeAreaView style={commonStyles.screen}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader title="Restricted Words" onBack={router.back} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profanity Filter</Text>
          <Text style={styles.helper}>
            One word/phrase per line (or comma-separated). Blocks posts + comments + usernames + bios.
          </Text>

          <View style={styles.addRow}>
            <TextInput
              value={newWord}
              onChangeText={setNewWord}
              placeholder="Add a blocked word/phrase (comma or enter supported)"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.addInput}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addWord}
              activeOpacity={0.85}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, isSaving && styles.btnDisabled]}
            onPress={saveBlockedWords}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>{isSaving ? "Saving..." : "Save Blocked Words"}</Text>
          </TouchableOpacity>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Saved words: {allWords.length}</Text>
            <View style={styles.previewActions}>
              <TouchableOpacity
                onPress={() => setShowBulkEditor((v) => !v)}
                activeOpacity={0.85}
              >
                <Text style={styles.previewAction}>{showBulkEditor ? "Hide bulk" : "Bulk edit"}</Text>
              </TouchableOpacity>
              <View style={styles.previewSpacer} />
              <TouchableOpacity
                onPress={() => setShowBlockedList((v) => !v)}
                activeOpacity={0.85}
              >
                <Text style={styles.previewAction}>{showBlockedList ? "Hide list" : "Show list"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showBulkEditor ? (
            <View style={styles.listCard}>
              <Text style={styles.helper}>
                Paste many words at once (comma or new line). Press “Apply bulk” to rebuild the list.
              </Text>
              <TextInput
                value={bulkText}
                onChangeText={setBulkText}
                placeholder={"spam, hateword\nphone number"}
                placeholderTextColor={theme.colors.textMuted}
                multiline
                style={[styles.textArea, { minHeight: 120 }]}
              />
              <TouchableOpacity
                style={[styles.secondaryBtn, isSaving && styles.btnDisabled]}
                onPress={applyBulk}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBtnText}>Apply Bulk</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {showBlockedList ? (
            <View style={styles.listCard}>
              <View style={styles.listTopRow}>
                <TextInput
                  value={blockedQuery}
                  onChangeText={setBlockedQuery}
                  placeholder="Search blocked words..."
                  placeholderTextColor={theme.colors.textMuted}
                  style={styles.search}
                />
                {allWords.length > previewWords.length ? (
                  <TouchableOpacity
                    onPress={() => setShowAllBlocked((v) => !v)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.previewAction}>
                      {showAllBlocked ? "Show less" : "Show all"}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {filteredWords.length ? (
                <>
                  <View style={styles.wordChips}>
                    {filteredWords.map((w) => (
                      <View key={w} style={styles.wordChip}>
                        <Text style={styles.wordChipText}>{w}</Text>
                        <TouchableOpacity
                          style={styles.wordRemove}
                          onPress={() => removeWord(w)}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="close" size={14} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  {!blockedQuery && !showAllBlocked && allWords.length > previewWords.length ? (
                    <Text style={styles.footnote}>… and {allWords.length - previewWords.length} more</Text>
                  ) : null}
                </>
              ) : (
                <Text style={styles.footnote}>{blockedQuery ? "No matches." : "No blocked words set."}</Text>
              )}
            </View>
          ) : (
            <Text style={styles.footnote}>List hidden (tap “Show list” to view).</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  helper: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  textArea: {
    backgroundColor: theme.colors.bgWhite,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
    minHeight: 160,
    textAlignVertical: "top",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  addInput: {
    flex: 1,
    backgroundColor: theme.colors.bgWhite,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
  },
  addButton: {
    marginLeft: theme.spacing.sm,
    height: 44,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
  },
  primaryBtn: {
    marginTop: theme.spacing.md,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primaryPink,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: theme.colors.white,
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize.md,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  previewRow: {
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewSpacer: {
    width: theme.spacing.md,
  },
  previewLabel: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
  previewAction: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primaryPink,
  },
  listCard: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.bgWhite,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  secondaryBtn: {
    marginTop: theme.spacing.md,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: theme.colors.text,
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize.sm,
  },
  listTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  search: {
    flex: 1,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.bgWhite,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
  },
  wordChips: {
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  wordChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.bgSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginRight: 8,
    marginBottom: 8,
  },
  wordRemove: {
    marginLeft: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.bgWhite,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  wordChipText: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
  },
  footnote: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textMuted,
  },
});
