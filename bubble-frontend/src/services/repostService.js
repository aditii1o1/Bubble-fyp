import { moderationService } from "./moderationService";
import { api } from "./apiClient";

function normalizeRepost(id, data) {
  const createdAt =
    data?.createdAt?.toDate?.()?.toISOString?.() || data?.createdAt || null;

  return {
    id,
    userId: data.userId, // uid
    originalBubbleId: data.originalBubbleId,
    originalText: data.originalText || "",
    overlayText: data.overlayText || "",
    timeAgo: data.timeAgo || "just now",
    originalAuthor: data.originalAuthor || "@anonymous",
    createdAt: createdAt || new Date().toISOString(),
  };
}

export const repostService = {
  createRepost: async ({
    uid,
    originalBubbleId,
    originalText,
    overlayText,
    originalAuthor,
  }) => {
    const check = await moderationService.checkText(overlayText);
    if (!check.ok) {
      throw new Error(`This word is blocked: "${check.word}"`);
    }

    const res = await api.post(`/posts/${String(originalBubbleId || "")}/reposts`, {
      overlayText: String(overlayText || "").trim(),
      originalText: String(originalText || ""),
      originalAuthor: String(originalAuthor || "@anonymous"),
    });
    const r = res.data?.repost;
    return r ? normalizeRepost(r.id, r) : null;
  },

  getUserReposts: async (uid, { pageSize = 20 } = {}) => {
    const userId = String(uid || "");
    const res = await api.get(`/reposts/user/${userId}`, { params: { pageSize } });
    const items = Array.isArray(res.data?.reposts) ? res.data.reposts : [];
    return items.map((r) => normalizeRepost(r.id, r));
  },

  deleteRepost: async (repostId) => {
    await api.delete(`/reposts/${String(repostId || "")}`);
    return true;
  },
};
