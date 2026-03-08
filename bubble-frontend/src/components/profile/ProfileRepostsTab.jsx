import React from "react";
import { View } from "react-native";
import EmptyState from "../common/EmptyState";
import RepostPreviewCard from "./RepostPreviewCard";

export default function ProfileRepostsTab({
  reposts = [],
  onPressRepost,
  onDeleteRepost,
}) {
  if (!reposts.length) {
    return (
      <EmptyState
        icon="repeat-outline"
        title="No reposts yet"
        message="Reposts you make will show up here."
      />
    );
  }

  return (
    <View>
      {reposts.map((repost) => (
        <RepostPreviewCard
          key={repost.id}
          repost={repost}
          onPress={() => onPressRepost?.(repost.originalBubbleId)}
          onDelete={onDeleteRepost ? () => onDeleteRepost(repost.id) : undefined}
        />
      ))}
    </View>
  );
}

