import React from "react";
import { View, Text } from "react-native";
import { styles } from "./RepostModal.styles";

export default function RepostPreview({ originalText = "", overlayText = "" }) {
  const trimmed = String(overlayText || "").trim();
  const showOverlay = trimmed.length > 0;

  return (
    <View style={styles.preview}>
      <Text style={styles.previewLabel}>Preview</Text>
      <View style={styles.previewCard}>
        <Text style={styles.previewText}>
          {originalText?.substring(0, 100) || ""}
          {originalText?.length > 100 ? (
            <Text style={styles.ellipsis}>...</Text>
          ) : null}
        </Text>

        {showOverlay ? <View style={styles.separator} /> : null}
        {showOverlay ? (
          <View style={styles.commentContainer}>
            <Text style={styles.commentText}>{trimmed}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

