import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/themes";
import ReportHeader from "./ReportHeader";
import ReportReasonOption from "./ReportReasonOption";
import { styles } from "./ReportModal.styles";
import { REPORT_REASONS } from "./reportReasons";

export default function ReportModal({ type = "post", onClose, onSubmit }) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = useMemo(
    () => REPORT_REASONS[type] || REPORT_REASONS.post,
    [type]
  );

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 250));

    await Promise.resolve(
      onSubmit?.({
        reason: selectedReason,
        additionalInfo: additionalInfo.trim(),
      })
    );

    setIsSubmitting(false);
    onClose?.();
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.modal}>
        <ReportHeader type={type} onClose={onClose} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>Select a reason</Text>

          {reasons.map((reason) => (
            <ReportReasonOption
              key={reason.id}
              reason={reason}
              selected={selectedReason === reason.id}
              onSelect={() => setSelectedReason(reason.id)}
            />
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
            activeOpacity={0.8}
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
            Reports are reviewed by our moderation team. False reports may result in
            account restrictions.
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}
