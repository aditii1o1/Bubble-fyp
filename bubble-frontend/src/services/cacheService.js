import AsyncStorage from "@react-native-async-storage/async-storage";

export const KEYS = {
  AUTH_USER: "@auth_user",
  AUTH_TOKEN: "@auth_token",
  AUTH_REFRESH_TOKEN: "@auth_refresh_token",
  RECENT_POSTS: "@recent_posts",
  USER_PREFS: "@user_preferences",
};

async function setJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function getJson(key) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const cacheService = {
  saveUser: async (userProfile) => setJson(KEYS.AUTH_USER, userProfile),
  getUser: async () => getJson(KEYS.AUTH_USER),

  saveToken: async (token) => AsyncStorage.setItem(KEYS.AUTH_TOKEN, String(token || "")),
  getToken: async () => AsyncStorage.getItem(KEYS.AUTH_TOKEN),

  saveRefreshToken: async (token) =>
    AsyncStorage.setItem(KEYS.AUTH_REFRESH_TOKEN, String(token || "")),
  getRefreshToken: async () => AsyncStorage.getItem(KEYS.AUTH_REFRESH_TOKEN),

  savePosts: async (posts) => setJson(KEYS.RECENT_POSTS, posts),
  getPosts: async () => getJson(KEYS.RECENT_POSTS),

  savePrefs: async (prefs) => setJson(KEYS.USER_PREFS, prefs),
  getPrefs: async () => getJson(KEYS.USER_PREFS),

  clearAll: async () => AsyncStorage.multiRemove(Object.values(KEYS)),
  clearAuth: async () =>
    AsyncStorage.multiRemove([KEYS.AUTH_USER, KEYS.AUTH_TOKEN, KEYS.AUTH_REFRESH_TOKEN]),
};
