import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Modal } from "react-native";
import { appActions, useAppContext } from "../../../context/AppContext";
import ReportModal from "../ReportModal";
import CommentInput from "./CommentInput";
import CommentCard from "./CommentCard";
import { styles } from "./CommentSection.styles";
import { commentService } from "../../../services/commentService";
import { adminService } from "../../../services/adminService";
import { useToast } from "../../../context/ToastContext";
import { moderationService } from "../../../services/moderationService";
import { notificationService } from "../../../services/notificationService";
import { confirmAlert } from "../../../utils/alertUtils";
import { commentReactionService } from "../../../services/commentReactionService";
const DEFAULT_REACTIONS = { heart: 0 };
export default function CommentSection({ bubbleId }) {
  const { state, dispatch } = useAppContext();
  const { showToast } = useToast();
  const uid = state.user?.uid || null;
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingComment, setReportingComment] = useState(null);
  const comments = useMemo(
    () => state.commentsByPostId[bubbleId] || [],
    [bubbleId, state.commentsByPostId]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!bubbleId) return;
        const fresh = await commentService.getComments(bubbleId, { pageSize: 50 });
        if (!alive) return;
        dispatch(appActions.setCommentsForPost(bubbleId, fresh));
        const map = {};
        fresh.forEach((c) => {
          if (c?.id && c.myReaction) map[c.id] = c.myReaction;
        });
        dispatch(appActions.setMyCommentReactionsForPost(bubbleId, map));
      } catch (e) {
        // keep UI usable offline
      }
    })();
    return () => {
      alive = false;
    };
  }, [bubbleId, dispatch]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    try {
      setIsSubmitting(true);
      if (!uid) {
        showToast("Please sign in to comment.", { type: "error" });
        return;
      }

      const check = await moderationService.checkText(newComment.trim());
      if (!check.ok) {
        showToast(`This word is blocked: \"${check.word}\"`, { type: "error" });
        return;
      }

      const now = Date.now();
      const tempId = `temp_c_${now}`;
      const optimistic = {
        id: tempId,
        bubbleId,
        userId: uid,
        nickname: state.profile.nickname || "@anonymous_user",
        avatar: state.profile.avatar || "cat",
        avatarUrl: state.profile.avatarUrl || null,
        text: newComment.trim(),
        createdAt: new Date(now).toISOString(),
        reactions: { ...DEFAULT_REACTIONS },
      };

      dispatch(appActions.addComment(bubbleId, optimistic));
      setNewComment("");
      setIsSubmitting(false);
      showToast("Comment posted!", { type: "success" });

      // Save in background (keeps UI fast).
      void (async () => {
        try {
          const created = await commentService.addComment({
            postId: bubbleId,
            uid,
            nickname: optimistic.nickname,
            avatar: optimistic.avatar,
            avatarUrl: optimistic.avatarUrl,
            text: optimistic.text,
          });
          dispatch(appActions.replaceComment(bubbleId, tempId, created));

          // Notify the post owner (best-effort).
          const post = (state.posts || []).find((p) => p.id === bubbleId);
          const toUid = post?.userId;
          if (toUid && toUid !== uid) {
            await notificationService.createNotification({
              toUid,
              type: "comment",
              text: `${optimistic.nickname} commented on your bubble`,
              fromNickname: optimistic.nickname,
              fromUserId: uid,
              postId: bubbleId,
            });
          }
        } catch (e) {
          dispatch(appActions.deleteCommentLocal(bubbleId, tempId));
          showToast(e?.message || "Could not post comment. Try again.", { type: "error" });
        }
      })();
    } catch (e) {
      showToast(e?.message || "Could not post comment.", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleReaction = (commentId, reactionKey) => {
    if (!uid) {
      showToast("Please sign in to like.", { type: "error" });
      return;
    }

    dispatch(appActions.toggleCommentReaction(bubbleId, commentId, reactionKey));

    void (async () => {
      try {
        const result = await commentReactionService.toggleCommentLike({
          postId: bubbleId,
          commentId,
        });
        dispatch(appActions.setCommentReactions(bubbleId, commentId, result.reactions));
        dispatch(
          appActions.setMyCommentReactionsForPost(bubbleId, {
            [commentId]: result.myReaction,
          })
        );
      } catch (e) {
        dispatch(appActions.toggleCommentReaction(bubbleId, commentId, reactionKey));
        showToast(e?.message || "Could not like comment. Try again.", { type: "error" });
      }
    })();
  };

  const handleDeleteComment = useCallback(
    (comment) => {
      if (!uid) {
        showToast("Please sign in to delete your comment.", { type: "error" });
        return;
      }
      if (!comment?.id || String(comment.id).startsWith("temp_")) {
        return;
      }
      if (String(comment.userId || "") !== String(uid)) {
        showToast("You can only delete your own comments.", { type: "error" });
        return;
      }

      confirmAlert({
        title: "Delete comment",
        message: "Are you sure you want to delete this comment?",
        confirmText: "Delete",
        confirmStyle: "destructive",
        onConfirm: () => {
          (async () => {
            try {
              dispatch(appActions.deleteCommentLocal(bubbleId, comment.id));
              await commentService.deleteComment({
                postId: bubbleId,
                commentId: comment.id,
              });
              showToast("Comment deleted.", { type: "success" });
            } catch (e) {
              showToast(e?.message || "Could not delete comment. Try again.", {
                type: "error",
              });
              try {
                const fresh = await commentService.getComments(bubbleId, {
                  pageSize: 50,
                });
                dispatch(appActions.setCommentsForPost(bubbleId, fresh));
              } catch {
                // ignore
              }
            }
          })();
        },
      });
    },
    [bubbleId, dispatch, showToast, uid]
  );

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
          targetType: "comment",
          targetId: reportingComment?.id,
          targetPostId: bubbleId,
          targetText: reportingComment?.text,
          reportedUserId: reportingComment?.userId,
          reportedUserNickname: reportingComment?.nickname,
          reason: data?.reason,
          description: data?.additionalInfo,
        });
        showToast("Report submitted. Thank you!", { type: "success" });
      } catch (e) {
        showToast(e?.message || "Could not submit report. Try again.", { type: "error" });
      } finally {
        setShowReportModal(false);
        setReportingComment(null);
      }
    })();
  };
  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={styles.commentCount}>
            <Text style={styles.commentCountText}>{comments.length}</Text>
          </View>
        </View>
        <CommentInput
          value={newComment}
          onChangeText={setNewComment}
          onSubmit={handleSubmitComment}
          isSubmitting={isSubmitting}
        />
        <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
          {!comments.length ? (
            <Text style={styles.emptyText}>No comments yet. Be the first to share!</Text>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                activeReaction={state.myCommentReactions?.[`${bubbleId}:${comment.id}`] || null}
                onReact={(key) => handleReaction(comment.id, key)}
                onDelete={
                  uid && String(comment.userId || "") === String(uid)
                    ? () => handleDeleteComment(comment)
                    : undefined
                }
                onReport={() => {
                  setReportingComment(comment);
                  setShowReportModal(true);
                }}
              />
            ))
          )}
        </ScrollView>
      </View>
      {showReportModal ? (
        <Modal
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowReportModal(false);
            setReportingComment(null);
          }}
        >
          <ReportModal
            type="comment"
            onClose={() => {
              setShowReportModal(false);
              setReportingComment(null);
            }}
            onSubmit={handleReport}
          />
        </Modal>
      ) : null}
    </>
  );
}
