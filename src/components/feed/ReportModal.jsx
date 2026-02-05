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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/themes";

const REPORT_REASONS = {
  post: [
    { id: "harassment", label: "Harassment or bullying" },
    { id: "hate", label: "Hate speech" },
    { id: "spam", label: "Spam or misleading" },
    { id: "violence", label: "Violence or dangerous content" },
    { id: "privacy", label: "Privacy violation" },
    { id: "inappropriate", label: "Inappropriate content" },
    { id: "other", label: "Other" },
  ],
  comment: [
    { id: "harassment", label: "Harassment or bullying" },
    { id: "hate", label: "Hate speech" },
    { id: "spam", label: "Spam" },
    { id: "inappropriate", label: "Inappropriate content" },
    { id: "other", label: "Other" },
  ],
};

export default function ReportModal({ type = "post", onClose, onSubmit }) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = REPORT_REASONS[type] || REPORT_REASONS.post;

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    onSubmit?.({
      reason: selectedReason,
      additionalInfo: additionalInfo.trim(),
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.modal}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="warning"
              size={24}
              color={theme.colors.primaryPink}
            />
          </View>
          <Text style={styles.title}>
            Report {type === "post" ? "Bubble" : "Comment"}
          </Text>
          <Text style={styles.subtitle}>
            Help us understand what's wrong with this {type}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>Select a reason</Text>

          {reasons.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              style={[
                styles.reasonButton,
                selectedReason === reason.id && styles.reasonButtonSelected,
              ]}
              onPress={() => setSelectedReason(reason.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.radioOuter,
                  selectedReason === reason.id && styles.radioOuterSelected,
                ]}
              >
                {selectedReason === reason.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text
                style={[
                  styles.reasonText,
                  selectedReason === reason.id && styles.reasonTextSelected,
                ]}
              >
                {reason.label}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
            Additional information (optional)
          </Text>
          <TextInput
            style={styles.textarea}
            placeholder="Provide more details to help us review..."
            placeholderTextColor={theme.colors.textMuted}
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            maxLength={500}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{additionalInfo.length}/500</Text>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedReason || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedReason || isSubmitting}
          >
            <Ionicons
              name="flag"
              size={18}
              color={theme.colors.white}
              style={styles.submitIcon}
            />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Reports are reviewed by our moderation team. False reports may
            result in account restrictions.
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
  },
  modal: {
    backgroundColor: theme.colors.bgWhite,
    borderRadius: theme.borderRadius.xl,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
    overflow: "hidden",
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    alignItems: "center",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryPink + "15", // Light pink background
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md,
  },
  sectionLabelSpaced: {
    marginTop: theme.spacing.lg,
  },
  reasonButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  reasonButtonSelected: {
    backgroundColor: theme.colors.primaryPink + "10", // Light pink background for selected
    borderColor: theme.colors.primaryPink,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  radioOuterSelected: {
    borderColor: theme.colors.primaryPink,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primaryPink,
  },
  reasonText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textDark,
    flex: 1,
  },
  reasonTextSelected: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryPink,
  },
  textarea: {
    backgroundColor: theme.colors.bgCream,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textDark,
    minHeight: 100,
    maxHeight: 150,
  },
  charCount: {
    textAlign: "right",
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryPink, // Changed to pink
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitIcon: {
    marginRight: theme.spacing.sm,
  },
  submitButtonText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fonts.bold,
    color: theme.colors.white,
  },
  disclaimer: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: theme.spacing.md,
    lineHeight: 18,
    paddingBottom: theme.spacing.md,
  },
});
