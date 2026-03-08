import React from "react";
import { View, Text } from "react-native";
import { getPreviewText } from "../../../lib/utils";
import { styles } from "./BubbleCard.styles";

export default function BubbleCardContent({ title = "", text = "", isExpanded }) {
  const showReadMore = !isExpanded && text.length > 100;
  const hasTitle = String(title || "").trim().length > 0;

  return (
    <View style={styles.contentContainer}>
      {hasTitle ? (
        <Text style={styles.postTitle} numberOfLines={isExpanded ? 0 : 2}>
          {title}
        </Text>
      ) : null}

      <Text style={styles.postBody}>
        {isExpanded ? text : getPreviewText(text, 100)}
      </Text>
      {showReadMore ? (
        <View style={styles.readMoreContainer}>
          <Text style={styles.readMore}>Tap to read more...</Text>
        </View>
      ) : null}
    </View>
  );
}
