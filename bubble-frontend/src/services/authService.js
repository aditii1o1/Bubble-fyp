import { apiClient } from "./apiClient";
import { cacheService } from "./cacheService";

function friendlyAuthError(err) {
  if (err?.code === "ECONNABORTED") {
    return "Request timed out. Check your connection and try again.";
  }

  const msg =
    String(err?.response?.data?.message || "") ||
    String(err?.message || "") ||
    "Something went wrong.";
  return msg;
}

function toProfile(user) {
  return {
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
}

export const authService = {
  signup: async ({ email, password } = {}) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    try {
      const res = await apiClient.post("/auth/register", {
        email: normalizedEmail,
        password: String(password || ""),
      });

      const user = res.data?.user || null;
      const accessToken = String(res.data?.accessToken || "");
      const refreshToken = String(res.data?.refreshToken || "");
      const needsVerification = res.data?.needsVerification !== false;

      if (user && accessToken && refreshToken) {
        const profile = toProfile(user);

        await Promise.all([
          cacheService.saveToken(accessToken),
          cacheService.saveRefreshToken(refreshToken),
          cacheService.saveUser(profile),
        ]);

        return {
          needsVerification: false,
          autoSignedIn: true,
          user: { uid: profile.uid, email: profile.email },
          token: accessToken,
          profile,
        };
      }

      return {
        needsVerification,
        email: normalizedEmail,
      };
    } catch (e) {
      throw new Error(friendlyAuthError(e));
    }
  },

  login: async (email, password) => {
    try {
      const res = await apiClient.post("/auth/login", {
        email: String(email || "").trim().toLowerCase(),
        password: String(password || ""),
      });

      const user = res.data?.user;
      const accessToken = String(res.data?.accessToken || "");
      const refreshToken = String(res.data?.refreshToken || "");
      if (!user || !accessToken || !refreshToken) throw new Error("Login failed");

      const profile = toProfile(user);

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
    const refreshToken = await cacheService.getRefreshToken();
    try {
      await cacheService.clearAuth();
    } finally {
      cacheService.clearFeedCache().catch(() => {
        // ignore cache cleanup failures after local logout
      });
      if (refreshToken) {
        apiClient.post("/auth/logout", { refreshToken }).catch(() => {
          // ignore revoke failures after local logout
        });
      }
    }
  },

  resetPassword: async (email) => {
    try {
      await apiClient.post("/auth/request-password-reset", {
        email: String(email || "").trim().toLowerCase(),
      });
      return true;
    } catch (e) {
      throw new Error(friendlyAuthError(e));
    }
  },
};
