import { api } from "./apiClient";

export const commentReactionService = {
  toggleCommentLike: async ({ postId, commentId }) => {
    const pid = String(postId || "");
    const cid = String(commentId || "");
    const res = await api.post(`/posts/${pid}/comments/${cid}/reactions/toggle`, {
      reactionKey: "heart",
    });
    return res.data;
  },
};

