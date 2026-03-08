import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/themes";
import RepostPreview from "./RepostPreview";
import { styles } from "./RepostModal.styles";

export default function RepostModal({ bubble, onClose, onRepost }) {
  const [overlayText, setOverlayText] = useState("");
  const [isReposting, setIsReposting] = useState(false);

  const handleRepost = async () => {
    setIsReposting(true);
    await new Promise((r) => setTimeout(r, 500));
    onRepost?.({ bubbleId: bubble.id, overlayText });
    setIsReposting(false);
    onClose?.();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Repost Bubble</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close" size={24} color={theme.colors.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <RepostPreview originalText={bubble.text} overlayText={overlayText} />

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
            style={[styles.repostButton, isReposting && styles.repostButtonDisabled]}
            onPress={handleRepost}
            disabled={isReposting}
            activeOpacity={0.8}
          >
            <Text style={styles.repostButtonText}>
              {isReposting ? "Reposting..." : "Repost"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

