import React from "react";
import { View } from "react-native";
import HeartLikeButton from "../../common/HeartLikeButton";

export default function CommentReactionsRow({
  reactions = {},
  activeReaction = null,
  onReact,
}) {
  const liked = activeReaction === "heart";
  const likeCount = Number(reactions?.heart || 0);
  return (
    <View>
      <HeartLikeButton
        liked={liked}
        count={likeCount}
        size={18}
        onPress={() => onReact?.("heart")}
      />
    </View>
  );
}
