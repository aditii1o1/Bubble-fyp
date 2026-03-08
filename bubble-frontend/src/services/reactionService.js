import { api } from "./apiClient";

function safeKey(k) {
  return String(k || "").trim();
}

export const reactionService = {
  // One reaction max
  togglePostReaction: async ({ postId, uid, reactionKey }) => {
    const pid = String(postId || "");
    const nextKey = "heart";
    const res = await api.post(`/posts/${pid}/reactions/toggle`, {
      reactionKey: nextKey,
    });
    return res.data;
  },

  // One read per post
  getMyReactionsForPosts: async ({ postIds = [], uid }) => {
    const ids = Array.isArray(postIds) ? postIds : [];
    if (ids.length === 0) return {};
    const res = await api.post("/posts/reactions/my-map", { postIds: ids });
    return res.data?.map || {};
  },
};
