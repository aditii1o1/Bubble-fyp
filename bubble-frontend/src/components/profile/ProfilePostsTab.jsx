import React from "react";
import { View } from "react-native";
import EmptyState from "../common/EmptyState";
import PostPreviewCard from "./PostPreviewCard";

export default function ProfilePostsTab({
  bubbles = [],
  onPressBubble,
  onDeleteBubble,
  onCreateBubble,
}) {
  if (!bubbles.length) {
    return (
      <EmptyState
        icon="chatbubble-outline"
        title="No posts yet"
        message="Share your first bubble with the community"
        actionLabel={onCreateBubble ? "Create Bubble" : undefined}
        onActionPress={onCreateBubble}
      />
    );
  }

  return (
    <View>
      {bubbles.map((bubble) => (
        <PostPreviewCard
          key={bubble.id}
          bubble={bubble}
          onPress={() => onPressBubble?.(bubble.id)}
          onDelete={onDeleteBubble ? () => onDeleteBubble(bubble.id) : undefined}
        />
      ))}
    </View>
  );
}

