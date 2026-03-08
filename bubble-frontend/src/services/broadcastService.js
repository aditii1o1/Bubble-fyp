import { api } from "./apiClient";

function normalizeBroadcast(id, data) {
  const createdAt =
    data?.createdAt?.toDate?.()?.toISOString?.() || data?.createdAt || null;
  return {
    id,
    title: data.title || "Announcement",
    message: data.message || "",
    createdByUid: data.createdByUid || null,
    createdByEmail: data.createdByEmail || null,
    createdAt: createdAt || new Date().toISOString(),
  };
}

export const broadcastService = {
  getBroadcasts: async ({ pageSize = 20 } = {}) => {
    const res = await api.get("/admin/broadcasts", { params: { pageSize } });
    const items = Array.isArray(res.data?.broadcasts) ? res.data.broadcasts : [];
    return items.map((b) => normalizeBroadcast(b.id, b));
  },

  // Create a broadcast and also copy it into each user's notifications list.
  // This keeps the UI simple (no separate "broadcasts" subscription).
  sendBroadcastToUsers: async ({
    title,
    message,
    users = [],
    createdByUid = null,
    createdByEmail = null,
  }) => {
    const res = await api.post("/admin/broadcasts", {
      title: String(title || "Announcement").trim() || "Announcement",
      message: String(message || "").trim(),
    });
    const b = res.data?.broadcast;
    return b ? normalizeBroadcast(b.id, b) : null;
  },
};
