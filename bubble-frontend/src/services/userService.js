import { api } from "./apiClient";

function normalizeUser(user) {
  if (!user || typeof user !== "object") return null;

  const id = String(user.id || user.uid || "").trim();
  return {
    ...user,
    id,
    uid: id,
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
  };
}

export const userService = {
  getMe: async () => {
    const res = await api.get("/me");
    return normalizeUser(res.data?.user);
  },

  getUserProfile: async (userId) => {
    const id = String(userId || "").trim();
    if (!id) return null;
    const res = await api.get(`/users/${id}`);
    return normalizeUser(res.data?.user);
  },

  completeOnboarding: async ({ username, bio, avatar, avatarUrl = null }) => {
    const res = await api.patch("/me/onboarding", {
      username,
      bio,
      avatar,
      avatarUrl,
    });
    return normalizeUser(res.data?.user);
  },

  updateProfile: async ({ bio, avatar, avatarUrl = null }) => {
    const res = await api.patch("/me/profile", { bio, avatar, avatarUrl });
    return normalizeUser(res.data?.user);
  },

  uploadAvatar: async (file) => {
    const form = new FormData();
    form.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    });

    const res = await api.post("/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return normalizeUser(res.data?.user);
  },
};
