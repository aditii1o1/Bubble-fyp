import Constants from "expo-constants";
import { Platform } from "react-native";
import * as Device from "expo-device";

function getDevHostFromExpoConfig() {
  const hostUri = String(Constants?.expoConfig?.hostUri || "").trim();
  if (!hostUri) return "";

  // hostUri usually looks like: "192.168.1.50:8081"
  const host = hostUri.split(":")[0].trim();
  return host;
}

function getLocalApiBaseUrl() {
  const isAndroidEmulator = Platform.OS === "android" && Device.isDevice === false;
  if (isAndroidEmulator) return "http://10.0.2.2:4000/api";

  const host = getDevHostFromExpoConfig();
  if (host) return `http://${host}:4000/api`;

  // iOS simulator / web dev fallback
  return "http://localhost:4000/api";
}

function shouldUseLocalApiInDev() {
  const raw = String(process.env.EXPO_PUBLIC_USE_LOCAL_API || "")
    .trim()
    .toLowerCase();
  return ["1", "true", "yes", "on"].includes(raw);
}

export function getApiBaseUrl() {
  const fromEnv = String(process.env.EXPO_PUBLIC_API_URL || "").trim();
  const extra = Constants?.expoConfig?.extra || {};
  const fromExtra = String(extra.apiUrl || "").trim();

  if (__DEV__ && shouldUseLocalApiInDev()) {
    return getLocalApiBaseUrl();
  }

  if (fromEnv) return fromEnv;
  if (fromExtra) return fromExtra;

  return getLocalApiBaseUrl();
}
