import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";

export default function RepostModal({ bubble, onClose, onRepost }) {
  const [overlayText, setOverlayText] = useState("");
  const [isReposting, setIsReposting] = useState(false);

  const handleRepost = async () => {
    setIsReposting(true);
    // TODO: POST /api/bubbles/{id}/repost
    await new Promise((r) => setTimeout(r, 500));
    onRepost && onRepost({ bubbleId: bubble.id, overlayText });
    setIsReposting(false);
    onClose();
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Repost Bubble</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Preview */}
            <View style={styles.preview}>
              <Text style={styles.previewLabel}>Preview</Text>
              <View style={styles.previewCard}>
                {/* Original bubble content */}
                <View
                  style={[
                    styles.originalContent,
                    overlayText && { marginBottom: 12 },
                  ]}
                >
                  <Text style={styles.previewText}>
                    {bubble.text?.substring(0, 100) || ""}
                    {bubble.text?.length > 100 && (
                      <Text style={styles.ellipsis}>...</Text>
                    )}
                  </Text>
                </View>

                {/* Separator line - only show when there's overlay text */}
                {overlayText ? <View style={styles.separator} /> : null}

                {/* Your comment/thoughts appears below original */}
                {overlayText ? (
                  <View style={styles.commentContainer}>
                    <Text style={styles.commentText}>{overlayText}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Text style={styles.label}>Add your thoughts (optional)</Text>
            <TextInput
              style={styles.textarea}
              placeholder="What do you think about this?"
              placeholderTextColor={theme.colors.textMuted}
              value={overlayText}
              onChangeText={setOverlayText}
              maxLength={100}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{overlayText.length}/100</Text>

            <TouchableOpacity
              style={[
                styles.repostButton,
                isReposting && styles.repostButtonDisabled,
              ]}
              onPress={handleRepost}
              disabled={isReposting}
            >
              <Text style={styles.repostButtonText}>
                {isReposting ? "Reposting..." : "Repost"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    backgroundColor: theme.colors.bgWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    marginTop: "auto",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.textDark,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  preview: {
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.textDark,
    marginBottom: 10,
  },
  previewCard: {
    backgroundColor: theme.colors.bgCream,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    minHeight: 120,
  },
  originalContent: {
    // Dynamic margin handled inline above
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginBottom: 12,
  },
  commentContainer: {
    backgroundColor: "#FFE4EC", // Light pink color
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primaryPink,
  },
  commentText: {
    color: "#8A2D55", // Darker pink for text
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    lineHeight: 20,
  },
  previewText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textDark,
    fontFamily: theme.fontFamily.regular,
    lineHeight: 20,
  },
  ellipsis: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textDark,
    fontFamily: theme.fontFamily.regular,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.textDark,
    marginBottom: 10,
  },
  textarea: {
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: 12,
    padding: 14,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textDark,
    minHeight: 80,
  },
  charCount: {
    textAlign: "right",
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 6,
    marginBottom: 16,
    fontFamily: theme.fontFamily.regular,
  },
  repostButton: {
    backgroundColor: theme.colors.primaryPink,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 34 : 20,
  },
  repostButtonDisabled: {
    opacity: 0.5,
  },
  repostButtonText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.white,
  },
});
