import AsyncStorage from "@react-native-async-storage/async-storage";

export const KEYS = {
  AUTH_USER: "@auth_user",
  AUTH_TOKEN: "@auth_token",
  AUTH_REFRESH_TOKEN: "@auth_refresh_token",
  RECENT_POSTS: "@recent_posts",
  USER_PREFS: "@user_preferences",
};

const AUTH_KEYS = [KEYS.AUTH_USER, KEYS.AUTH_TOKEN, KEYS.AUTH_REFRESH_TOKEN];
const SESSION_KEYS = [...AUTH_KEYS, KEYS.RECENT_POSTS];

const authCache = {
  loaded: false,
  user: null,
  token: "",
  refreshToken: "",
};

function normalizeToken(value) {
  return String(value || "");
}

function parseJson(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function hydrateAuthCache(entries = []) {
  const map = new Map(entries);
  authCache.loaded = true;
  authCache.user = parseJson(map.get(KEYS.AUTH_USER));
  authCache.token = normalizeToken(map.get(KEYS.AUTH_TOKEN));
  authCache.refreshToken = normalizeToken(map.get(KEYS.AUTH_REFRESH_TOKEN));
  return {
    user: authCache.user,
    token: authCache.token,
    refreshToken: authCache.refreshToken,
  };
}

async function loadAuthCache() {
  if (authCache.loaded) {
    return {
      user: authCache.user,
      token: authCache.token,
      refreshToken: authCache.refreshToken,
    };
  }

  const entries = await AsyncStorage.multiGet(AUTH_KEYS);
  return hydrateAuthCache(entries);
}

function getCachedAuthSession() {
  return {
    user: authCache.user,
    token: authCache.token,
    refreshToken: authCache.refreshToken,
  };
}

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
  saveAuthSession: async ({ userProfile, token, refreshToken } = {}) => {
    const entries = [];

    if (userProfile !== undefined) {
      authCache.user = userProfile ?? null;
      authCache.loaded = true;
      entries.push([KEYS.AUTH_USER, JSON.stringify(authCache.user)]);
    }
    if (token !== undefined) {
      authCache.token = normalizeToken(token);
      authCache.loaded = true;
      entries.push([KEYS.AUTH_TOKEN, authCache.token]);
    }
    if (refreshToken !== undefined) {
      authCache.refreshToken = normalizeToken(refreshToken);
      authCache.loaded = true;
      entries.push([KEYS.AUTH_REFRESH_TOKEN, authCache.refreshToken]);
    }

    if (entries.length) {
      await AsyncStorage.multiSet(entries);
    }
  },

  getAuthSession: async () => loadAuthCache(),
  getCachedAuthSession,

  saveUser: async (userProfile) => {
    authCache.user = userProfile ?? null;
    authCache.loaded = true;
    await setJson(KEYS.AUTH_USER, authCache.user);
  },
  getUser: async () => {
    const session = await loadAuthCache();
    return session.user;
  },

  saveToken: async (token) => {
    authCache.token = normalizeToken(token);
    authCache.loaded = true;
    await AsyncStorage.setItem(KEYS.AUTH_TOKEN, authCache.token);
  },
  getToken: async () => {
    const session = await loadAuthCache();
    return session.token;
  },

  saveRefreshToken: async (token) => {
    authCache.refreshToken = normalizeToken(token);
    authCache.loaded = true;
    await AsyncStorage.setItem(KEYS.AUTH_REFRESH_TOKEN, authCache.refreshToken);
  },
  getRefreshToken: async () => {
    const session = await loadAuthCache();
    return session.refreshToken;
  },

  savePosts: async (posts) => setJson(KEYS.RECENT_POSTS, posts),
  getPosts: async () => getJson(KEYS.RECENT_POSTS),

  savePrefs: async (prefs) => setJson(KEYS.USER_PREFS, prefs),
  getPrefs: async () => getJson(KEYS.USER_PREFS),

  clearAll: async () => {
    authCache.loaded = true;
    authCache.user = null;
    authCache.token = "";
    authCache.refreshToken = "";
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
  clearAuth: async () => {
    authCache.loaded = true;
    authCache.user = null;
    authCache.token = "";
    authCache.refreshToken = "";
    await AsyncStorage.multiRemove(AUTH_KEYS);
  },
  clearSession: async () => {
    authCache.loaded = true;
    authCache.user = null;
    authCache.token = "";
    authCache.refreshToken = "";
    await AsyncStorage.multiRemove(SESSION_KEYS);
  },
  clearFeedCache: async () => AsyncStorage.removeItem(KEYS.RECENT_POSTS),
};
