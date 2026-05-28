import { apiClient } from "./apiClient";
import { cacheService } from "./cacheService";
import { toAppError } from "../utils/errorMessage";

const AUTH_REQUEST_TIMEOUT_MS = 10000;

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
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
  };
}

export const authService = {
  signup: async ({ email, password } = {}) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    try {
      const res = await apiClient.post(
        "/auth/register",
        {
          email: normalizedEmail,
          password: String(password || ""),
        },
        { timeout: AUTH_REQUEST_TIMEOUT_MS }
      );

      const user = res.data?.user || null;
      const accessToken = String(res.data?.accessToken || "");
      const refreshToken = String(res.data?.refreshToken || "");
      const needsVerification = res.data?.needsVerification !== false;

      if (user && accessToken && refreshToken) {
        const profile = toProfile(user);

        await cacheService.saveAuthSession({
          userProfile: profile,
          token: accessToken,
          refreshToken,
        });

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
      throw toAppError(e, { fallbackMessage: "Could not create your account. Please try again." });
    }
  },

  login: async (email, password) => {
    try {
      const res = await apiClient.post(
        "/auth/login",
        {
          email: String(email || "").trim().toLowerCase(),
          password: String(password || ""),
        },
        { timeout: AUTH_REQUEST_TIMEOUT_MS }
      );

      const user = res.data?.user;
      const accessToken = String(res.data?.accessToken || "");
      const refreshToken = String(res.data?.refreshToken || "");
      if (!user || !accessToken || !refreshToken) throw new Error("Login failed");

      const profile = toProfile(user);

      await cacheService.saveAuthSession({
        userProfile: profile,
        token: accessToken,
        refreshToken,
      });

      return { user: { uid: profile.uid, email: profile.email }, token: accessToken, profile };
    } catch (e) {
      throw toAppError(e, { fallbackMessage: "Could not sign in. Please try again." });
    }
  },

  resendVerificationEmail: async ({ email } = {}) => {
    try {
      await apiClient.post(
        "/auth/resend-verification",
        {
          email: String(email || "").trim().toLowerCase(),
        },
        { timeout: AUTH_REQUEST_TIMEOUT_MS }
      );
      return true;
    } catch (e) {
      throw toAppError(e, {
        fallbackMessage: "Could not resend the verification link. Please try again.",
      });
    }
  },

  logout: async () => {
    const cachedSession = cacheService.getCachedAuthSession();
    const refreshToken =
      cachedSession?.refreshToken || (await cacheService.getRefreshToken());
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
      throw toAppError(e, { fallbackMessage: "Could not send the reset link. Please try again." });
    }
  },
};
