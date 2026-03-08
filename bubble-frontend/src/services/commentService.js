import { moderationService } from "./moderationService";
import { api } from "./apiClient";

function normalizeComment(id, data) {
  const createdAt =
    data?.createdAt?.toDate?.()?.toISOString?.() || data?.createdAt || null;

  return {
    id,
    bubbleId: data.postId,
    userId: data.userId,
    nickname: data.nickname || "@anonymous",
    avatar: data.avatar || "cat",
    avatarUrl: data.avatarUrl || null,
    text: data.text || "",
    createdAt: createdAt || new Date().toISOString(),
    reactions: data.reactions || { heart: 0 },
    myReaction: data.myReaction || null,
  };
}

export const commentService = {
  getComments: async (postId, { pageSize = 50 } = {}) => {
    const pid = String(postId || "");
    const res = await api.get(`/posts/${pid}/comments`, { params: { pageSize } });
    const items = Array.isArray(res.data?.comments) ? res.data.comments : [];
    return items.map((c) => normalizeComment(c.id, { postId: pid, ...c }));
  },

  addComment: async ({ postId, uid, nickname, avatar, avatarUrl, text }) => {
    const pid = String(postId || "");
    const check = await moderationService.checkText(text);
    if (!check.ok) {
      throw new Error(`This word is blocked: "${check.word}"`);
    }

    const res = await api.post(`/posts/${pid}/comments`, {
      text: String(text || "").trim(),
    });
    const c = res.data?.comment;
    return c ? normalizeComment(c.id, { postId: pid, ...c }) : null;
  },

  deleteComment: async ({ postId, commentId }) => {
    const pid = String(postId || "");
    const cid = String(commentId || "");
    await api.delete(`/posts/${pid}/comments/${cid}`);
    return true;
  },
};
