import React from "react";
import { View, ScrollView } from "react-native";
import TagChip from "../TagChip";
import { styles } from "./BubbleCard.styles";

export default function BubbleCardTags({ tags = [], visible }) {
  if (!visible || !tags.length) return null;

  return (
    <View style={styles.tagsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
        {tags.map((tag) => (
          <TagChip key={tag} tag={tag} />
        ))}
      </ScrollView>
    </View>
  );
}

