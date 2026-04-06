import { api } from "./apiClient";

export const userService = {
  getMe: async () => {
    const res = await api.get("/me");
    return res.data?.user || null;
  },

  completeOnboarding: async ({ username, bio, avatar, avatarUrl = null }) => {
    const res = await api.patch("/me/onboarding", {
      username,
      bio,
      avatar,
      avatarUrl,
    });
    return res.data?.user || null;
  },

  updateProfile: async ({ bio, avatar, avatarUrl = null }) => {
    const res = await api.patch("/me/profile", { bio, avatar, avatarUrl });
    return res.data?.user || null;
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

    return res.data?.user || null;
  },
};
