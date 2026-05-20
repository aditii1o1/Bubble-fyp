import axios from "axios";
import { getApiBaseUrl } from "../config/api";
import { cacheService } from "./cacheService";
import { toAppError } from "../utils/errorMessage";

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toAppError(error))
);

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const cachedSession = cacheService.getCachedAuthSession();
      const refreshToken = cachedSession?.refreshToken || (await cacheService.getRefreshToken());
      if (!refreshToken) {
        await cacheService.clearAuth();
        return null;
      }

      try {
        const res = await apiClient.post("/auth/refresh", { refreshToken });
        const nextAccessToken = String(res.data?.accessToken || "");
        const nextRefreshToken = String(res.data?.refreshToken || "");
        if (!nextAccessToken || !nextRefreshToken) {
          await cacheService.clearAuth();
          return null;
        }

        await cacheService.saveAuthSession({
          token: nextAccessToken,
          refreshToken: nextRefreshToken,
        });
        return nextAccessToken;
      } catch (err) {
        const status = err?.status || err?.response?.status;
        if (status === 401 || status === 403) {
          await cacheService.clearAuth();
          return null;
        }
        throw err;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function apiRequest(config) {
  const cachedSession = cacheService.getCachedAuthSession();
  const token = cachedSession?.token || (await cacheService.getToken()) || "";
  const headers = { ...(config?.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    return await apiClient({ ...config, headers });
  } catch (err) {
    const status = err?.status || err?.response?.status;
    if (status !== 401 || config?._retriedAfterRefresh) throw err;

    const nextAccessToken = await refreshAccessToken();
    if (!nextAccessToken) throw err;

    return apiClient({
      ...config,
      _retriedAfterRefresh: true,
      headers: { ...headers, Authorization: `Bearer ${nextAccessToken}` },
    });
  }
}

export const api = {
  get: (url, config = {}) => apiRequest({ ...config, method: "GET", url }),
  post: (url, data, config = {}) => apiRequest({ ...config, method: "POST", url, data }),
  patch: (url, data, config = {}) => apiRequest({ ...config, method: "PATCH", url, data }),
  put: (url, data, config = {}) => apiRequest({ ...config, method: "PUT", url, data }),
  delete: (url, config = {}) => apiRequest({ ...config, method: "DELETE", url }),
};
