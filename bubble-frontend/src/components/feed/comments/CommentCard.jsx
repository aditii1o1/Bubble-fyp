import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, TouchableOpacity, Image, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/themes";
import { formatTimeAgo } from "../../../lib/utils";
import { getAvatarEmoji } from "../../../lib/avatars";
import CommentReactionsRow from "./CommentReactionsRow";
import { styles } from "./CommentSection.styles";

export default function CommentCard({
  comment,
  onReact,
  onReport,
  onDelete,
  activeReaction,
}) {
  const lastTapRef = useRef(0);
  const singleTapTimerRef = useRef(null);
  const heartAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
    };
  }, []);

  const showHeartBurst = () => {
    heartAnim.setValue(0);
    Animated.timing(heartAnim, {
      toValue: 1,
      duration: 360,
      useNativeDriver: true,
    }).start(() => {
      heartAnim.setValue(0);
    });
  };

  const handleDoubleTapLike = () => {
    const now = Date.now();
    const delta = now - lastTapRef.current;

    if (delta < 280) {
      lastTapRef.current = 0;
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
      singleTapTimerRef.current = null;
      showHeartBurst();
      if (activeReaction !== "heart") onReact?.("heart");
      return;
    }

    lastTapRef.current = now;
    if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
    singleTapTimerRef.current = setTimeout(() => {
      singleTapTimerRef.current = null;
    }, 300);
  };

  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <Pressable style={styles.userInfo}>
          <View style={styles.commentAvatarCircle}>
            {comment.avatarUrl ? (
              <Image source={{ uri: comment.avatarUrl }} style={styles.commentAvatarImage} />
            ) : (
              <Text style={styles.commentAvatar}>
                {getAvatarEmoji(comment.avatar || "cat")}
              </Text>
            )}
          </View>
          <Text style={styles.commentNickname}>{comment.nickname}</Text>
        </Pressable>

        <View style={styles.commentHeaderRight}>
          <Text style={styles.commentTime}>{formatTimeAgo(comment.createdAt)}</Text>
          {onDelete ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDelete}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={16} color={theme.colors.errorRed} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onReport}
            activeOpacity={0.8}
          >
            <Ionicons
              name="warning-outline"
              size={16}
              color={theme.colors.errorRed}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ position: "relative" }}>
        <Pressable onPress={handleDoubleTapLike}>
          <Text style={styles.commentText}>{comment.text}</Text>
        </Pressable>
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 6,
            alignItems: "center",
            opacity: heartAnim,
            transform: [
              {
                scale: heartAnim.interpolate({
                  inputRange: [0, 0.4, 1],
                  outputRange: [0.6, 1.1, 1.0],
                }),
              },
            ],
          }}
        >
          <Ionicons name="heart" size={34} color={theme.colors.primaryPink} />
        </Animated.View>
      </View>

      <View style={styles.reactionBar}>
        <CommentReactionsRow
          reactions={comment.reactions || {}}
          activeReaction={activeReaction}
          onReact={onReact}
        />
      </View>
    </View>
  );
}
