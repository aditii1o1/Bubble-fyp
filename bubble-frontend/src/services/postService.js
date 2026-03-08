import { moderationService } from "./moderationService";
import { api } from "./apiClient";

function normalizePost(id, data) {
  const createdAt =
    data?.createdAt?.toDate?.()?.toISOString?.() || data?.createdAt || null;
  const expiresAt =
    data?.expiresAt?.toDate?.()?.toISOString?.() || data?.expiresAt || null;

  return {
    id,
    userId: data.userId, // uid
    nickname: data.nickname || "@anonymous",
    avatar: data.avatar || "cat",
    avatarUrl: data.avatarUrl || null,
    title: data.title || "",
    text: data.text || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    reactions: data.reactions || { heart: 0 },
    commentCount: data.commentCount || 0,
    comments: data.commentCount || 0, // kept for backward compat in UI
    viewCount: data.viewCount || 0,
    createdAt: createdAt || new Date().toISOString(),
    expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

function isExpired(post) {
  const exp = post?.expiresAt;
  if (!exp) return false;
  const t = new Date(exp).getTime();
  if (!Number.isFinite(t)) return false;
  return t <= Date.now();
}

function sortByCreatedAtDesc(items) {
  return [...items].sort((a, b) => {
    const ta = new Date(a?.createdAt || 0).getTime();
    const tb = new Date(b?.createdAt || 0).getTime();
    return tb - ta;
  });
}

export const postService = {
  createPost: async ({ uid, nickname, avatar, avatarUrl, title, text, tags }) => {
    const check = await moderationService.checkText(
      `${String(title || "")} ${String(text || "")}`
    );
    if (!check.ok) {
      throw new Error(`This word is blocked: "${check.word}"`);
    }

    const res = await api.post("/posts", {
      title: String(title || "").trim(),
      text: String(text || "").trim(),
      tags: Array.isArray(tags) ? tags : [],
    });
    return normalizePost(res.data?.post?.id, res.data?.post || {});
  },

  getFeed: async ({ pageSize = 20 } = {}) => {
    const res = await api.get("/posts/feed", { params: { pageSize } });
    const posts = Array.isArray(res.data?.posts) ? res.data.posts : [];
    return posts.map((p) => normalizePost(p.id, p));
  },

  subscribeFeed: ({ pageSize = 20, onNext, onError } = {}) => {
    let alive = true;
    let timer = null;

    const tick = async () => {
      try {
        const items = await postService.getFeed({ pageSize });
        if (alive && typeof onNext === "function") onNext(items);
      } catch (e) {
        if (alive && typeof onError === "function") onError(e);
      }
    };

    tick();
    timer = setInterval(tick, 8000);
    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  },

  getUserPosts: async (uid, { pageSize = 20 } = {}) => {
    const userId = String(uid || "");
    const res = await api.get(`/posts/user/${userId}`, { params: { pageSize } });
    const posts = Array.isArray(res.data?.posts) ? res.data.posts : [];
    return posts.map((p) => normalizePost(p.id, p));
  },

  getPostById: async (postId) => {
    const id = String(postId || "");
    const res = await api.get(`/posts/${id}`);
    const post = res.data?.post;
    return post ? normalizePost(post.id, post) : null;
  },

  deletePost: async (postId) => {
    await api.delete(`/posts/${String(postId || "")}`);
    return true;
  },

  updateUserPostsAuthor: async (uid, updates = {}) => {
    // Backend will handle this later (optional)
    return 0;
  },
};
