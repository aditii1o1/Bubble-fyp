import { api } from "./apiClient";
import { cacheService } from "./cacheService";

function friendlyAuthError(err) {
  const msg =
    String(err?.response?.data?.message || "") ||
    String(err?.message || "") ||
    "Something went wrong.";
  return msg;
}

export const authService = {
  signup: async ({ email, password } = {}) => {
    try {
      await api.post("/auth/register", {
        email: String(email || "").trim().toLowerCase(),
        password: String(password || ""),
      });
    } catch (e) {
      throw new Error(friendlyAuthError(e));
    }
    return { needsVerification: true, email: String(email || "").trim().toLowerCase() };
  },

  login: async (email, password) => {
    try {
      const res = await api.post("/auth/login", {
        email: String(email || "").trim().toLowerCase(),
        password: String(password || ""),
      });

      const user = res.data?.user;
      const accessToken = String(res.data?.accessToken || "");
      const refreshToken = String(res.data?.refreshToken || "");
      if (!user || !accessToken || !refreshToken) throw new Error("Login failed");

      const profile = {
        uid: user.id,
        email: user.email,
        role: user.role,
        banned: !!user.banned,
        onboarded: !!user.onboarded,
        username: user.username || "",
        nickname: user.nickname || "@anonymous",
        bio: user.bio || "",
        avatar: user.avatar || "cat",
        avatarUrl: user.avatarUrl || null,
      };

      await Promise.all([
        cacheService.saveToken(accessToken),
        cacheService.saveRefreshToken(refreshToken),
        cacheService.saveUser(profile),
      ]);

      return { user: { uid: profile.uid, email: profile.email }, token: accessToken, profile };
    } catch (e) {
      throw new Error(friendlyAuthError(e));
    }
  },

  logout: async () => {
    try {
      const refreshToken = await cacheService.getRefreshToken();
      try {
        await api.post("/auth/logout", { refreshToken });
      } catch {
        // ignore
      }
    } finally {
      await cacheService.clearAll();
    }
  },

  resetPassword: async (email) => {
    try {
      await api.post("/auth/request-password-reset", {
        email: String(email || "").trim().toLowerCase(),
      });
      return true;
    } catch (e) {
      throw new Error(friendlyAuthError(e));
    }
  },
};
