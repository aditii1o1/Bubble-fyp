import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { theme } from "../../../constants/themes";
import { styles } from "./CommentSection.styles";

export default function CommentInput({
  value,
  onChangeText,
  onSubmit,
  isSubmitting,
  maxLength = 500,
}) {
  const disabled = !String(value || "").trim() || isSubmitting;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.inputContainer}
    >
      <TextInput
        style={styles.textarea}
        placeholder="Share your thoughts anonymously..."
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
      <View style={styles.inputFooter}>
        <Text style={styles.charCount}>{String(value || "").length}/{maxLength}</Text>
        <TouchableOpacity
          style={[styles.submitButton, disabled && styles.submitButtonDisabled]}
          onPress={onSubmit}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Posting..." : "Post"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

