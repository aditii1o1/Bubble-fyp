import axios from "axios";
import { getApiBaseUrl } from "../config/api";
import { cacheService } from "./cacheService";

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
});

async function refreshAccessToken() {
  const refreshToken = await cacheService.getRefreshToken();
  if (!refreshToken) return null;

  const res = await apiClient.post("/auth/refresh", { refreshToken });
  const nextAccessToken = String(res.data?.accessToken || "");
  const nextRefreshToken = String(res.data?.refreshToken || "");
  if (!nextAccessToken || !nextRefreshToken) return null;

  await cacheService.saveToken(nextAccessToken);
  await cacheService.saveRefreshToken(nextRefreshToken);
  return nextAccessToken;
}

export async function apiRequest(config) {
  const token = (await cacheService.getToken()) || "";
  const headers = { ...(config?.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    return await apiClient({ ...config, headers });
  } catch (err) {
    const status = err?.response?.status;
    if (status !== 401) throw err;

    const nextAccessToken = await refreshAccessToken();
    if (!nextAccessToken) {
      await cacheService.clearAuth();
      throw err;
    }

    return apiClient({
      ...config,
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
