import AsyncStorage from "@react-native-async-storage/async-storage";
import BACKEND_CONFIG from "../config/backend";

const buildUrl = (path) => {
  if (!path) return BACKEND_CONFIG.baseUrl;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_CONFIG.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const withTimeout = (promise, timeoutMs) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timed out")), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
};

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem(BACKEND_CONFIG.tokenStorageKey);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiRequest = async (path, options = {}) => {
  const url = buildUrl(path);
  const authHeader = await getAuthHeader();
  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  const response = await withTimeout(
    fetch(url, config),
    BACKEND_CONFIG.timeoutMs
  );

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || "Request failed";
    throw new Error(message);
  }

  return payload;
};

export default apiRequest;
