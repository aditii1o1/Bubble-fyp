import React, { useEffect, useRef, useState } from "react";
import { View, Modal, Pressable, Animated } from "react-native";
import EmojiReactionBar from "../EmojiReactionBar";
import CommentSection from "../CommentSection";
import ReportModal from "../ReportModal";
import RepostModal from "../RepostModal";
import { formatTimeRemaining } from "../../../lib/utils";
import { appActions, useAppContext } from "../../../context/AppContext";
import { repostService } from "../../../services/repostService";
import { adminService } from "../../../services/adminService";
import { notificationService } from "../../../services/notificationService";
import { useToast } from "../../../context/ToastContext";
import { moderationService } from "../../../services/moderationService";
import BubbleCardHeader from "./BubbleCardHeader";
import BubbleCardContent from "./BubbleCardContent";
import BubbleCardTags from "./BubbleCardTags";
import { styles } from "./BubbleCard.styles";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/themes";
export default function BubbleCard({ bubble, onReact, onViewProfile }) {
  const { state, dispatch } = useAppContext();
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const lastTapRef = useRef(0);
  const singleTapTimerRef = useRef(null);
  const heartAnim = useRef(new Animated.Value(0)).current;
  const timeRemaining = formatTimeRemaining(bubble.expiresAt);
  const isExpiringSoon = timeRemaining?.hours < 3;
  const activeReaction = state.myReactions[bubble.id] || null;
  const handleReaction = (reactionKey) => {
    if (onReact) return onReact(bubble.id, reactionKey);
    dispatch(appActions.toggleReaction(bubble.id, reactionKey));
  };

  useEffect(() => {
    return () => {
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
    };
  }, []);

  const showHeartBurst = () => {
    heartAnim.setValue(0);
    Animated.timing(heartAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start(() => {
      heartAnim.setValue(0);
    });
  };

  const handleCardPress = () => {
    if (isExpanded) return;

    const now = Date.now();
    const delta = now - lastTapRef.current;

    if (delta < 280) {
      // Double tap
      lastTapRef.current = 0;
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
      singleTapTimerRef.current = null;

      showHeartBurst();
      if (activeReaction !== "heart") handleReaction("heart");
      return;
    }

    lastTapRef.current = now;
    if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
    singleTapTimerRef.current = setTimeout(() => {
      singleTapTimerRef.current = null;
      setIsExpanded(true);
    }, 300);
  };
  const handleRepost = (data) => {
    const uid = state.user?.uid;
    if (!uid) {
      showToast("Please sign in to repost.", { type: "error" });
      return;
    }

    (async () => {
      try {
        const created = await repostService.createRepost({
          uid,
          originalBubbleId: data?.bubbleId || bubble.id,
          originalText: bubble.text,
          overlayText: String(data?.overlayText || "").trim(),
          originalAuthor: bubble.nickname || "@anonymous",
        });
        dispatch(appActions.addRepost(created));
        showToast("Reposted!", { type: "success" });

        // Notify original post owner (best-effort).
        if (bubble.userId && bubble.userId !== uid) {
          await notificationService.createNotification({
            toUid: bubble.userId,
            type: "repost",
            text: `${state.profile.nickname || "@someone"} reposted your bubble`,
            fromNickname: state.profile.nickname || "@someone",
            fromUserId: uid,
            postId: bubble.id,
          });
        }
      } catch (e) {
        showToast(e?.message || "Could not repost. Try again.", { type: "error" });
      } finally {
        setShowRepostModal(false);
      }
    })();
  };
  const handleReport = (data) => {
    const uid = state.user?.uid;
    if (!uid) {
      showToast("Please sign in to report.", { type: "error" });
      return;
    }

    (async () => {
      try {
        const extra = String(data?.additionalInfo || "").trim();
        if (extra) {
          const check = await moderationService.checkText(extra);
          if (!check.ok) {
            showToast(`This word is blocked: "${check.word}"`, { type: "error" });
            return;
          }
        }

        await adminService.createReport({
          reporterUid: uid,
          reporterEmail: state.user?.email,
          reporterNickname: state.profile?.nickname,
          targetType: "post",
          targetId: bubble.id,
          targetText: bubble.text,
          reportedUserId: bubble.userId,
          reportedUserNickname: bubble.nickname,
          reason: data?.reason,
          description: data?.additionalInfo,
        });
        showToast("Report submitted. Thank you!", { type: "success" });
      } catch (e) {
        showToast(e?.message || "Could not submit report. Try again.", { type: "error" });
      } finally {
        setShowReportModal(false);
      }
    })();
  };
  return (
    <>
      <View style={styles.container}>
        <Pressable style={styles.card} onPress={handleCardPress}>
          <BubbleCardHeader
            bubble={bubble}
            timeText={timeRemaining?.display}
            isExpanded={isExpanded}
            isExpiringSoon={isExpiringSoon}
            onClose={() => setIsExpanded(false)}
            onViewProfile={onViewProfile}
          />

          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 70,
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
            <Ionicons name="heart" size={64} color={theme.colors.primaryPink} />
          </Animated.View>

          <BubbleCardContent
            title={bubble.title}
            text={bubble.text}
            isExpanded={isExpanded}
          />
          <BubbleCardTags tags={bubble.tags} visible={isExpanded} />
          <View style={styles.reactionContainer}>
            <EmojiReactionBar
              reactions={bubble.reactions || {}}
              activeReaction={activeReaction}
              onReact={handleReaction}
              onRepost={() => setShowRepostModal(true)}
              onReport={() => setShowReportModal(true)}
            />
          </View>
          {isExpanded ? (
            <View style={styles.commentsContainer}>
              <CommentSection bubbleId={bubble.id} />
            </View>
          ) : null}
        </Pressable>
      </View>
      {showRepostModal ? (
        <Modal transparent animationType="slide" onRequestClose={() => setShowRepostModal(false)}>
          <RepostModal
            bubble={bubble}
            onClose={() => setShowRepostModal(false)}
            onRepost={handleRepost}
          />
        </Modal>
      ) : null}
      {showReportModal ? (
        <Modal transparent animationType="fade" onRequestClose={() => setShowReportModal(false)}>
          <ReportModal
            type="post"
            onClose={() => setShowReportModal(false)}
            onSubmit={handleReport}
          />
        </Modal>
      ) : null}
    </>
  );
}
