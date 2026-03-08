import { api } from "./apiClient";

function normalizeNotification(id, data) {
  const createdAt =
    data?.createdAt?.toDate?.()?.toISOString?.() || data?.createdAt || null;

  return {
    id,
    type: data.type || "info", // reaction | comment | repost | broadcast | info
    text: data.text || "",
    fromNickname: data.fromNickname || null,
    fromUserId: data.fromUserId || null,
    postId: data.postId || null,
    read: !!data.read,
    createdAt: createdAt || new Date().toISOString(),
  };
}

export const notificationService = {
  getMyNotifications: async (uid, { pageSize = 30 } = {}) => {
    const res = await api.get("/notifications", { params: { pageSize } });
    const items = Array.isArray(res.data?.notifications) ? res.data.notifications : [];
    return items.map((n) => normalizeNotification(n.id, n));
  },

  markRead: async ({ uid, notificationId }) => {
    const notifId = String(notificationId || "");
    if (!notifId) return false;
    await api.post(`/notifications/${notifId}/read`);
    return true;
  },

  markAllRead: async ({ uid }) => {
    await api.post("/notifications/read-all");
    return 0;
  },

  // FYP-friendly: notifications are created client-side (no Cloud Functions).
  // This is not "enterprise secure", but good for a demo project.
  createNotification: async ({
    toUid,
    type = "info",
    text = "",
    fromNickname = null,
    fromUserId = null,
    postId = null,
  }) => {
    const userId = String(toUid || "");
    if (!userId) return null;
    const res = await api.post("/notifications", {
      toUserId: userId,
      type,
      text,
      fromNickname,
      fromUserId,
      postId,
    });
    const n = res.data?.notification;
    return n ? normalizeNotification(n.id, n) : null;
  },
};
