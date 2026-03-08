import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./apiClient";

const CACHE_KEY = "@blocked_words";
const CACHE_TS_KEY = "@blocked_words_ts";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function normalizeWords(words) {
  const arr = Array.isArray(words) ? words : [];
  return arr
    .map((w) => String(w || "").trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 200);
}

function normalizeTextForMatch(text) {
  // Normalize text
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const moderationService = {
  getBlockedWords: async () => {
    // Firestore first
    try {
      const res = await api.get("/moderation/blocked-words", { timeout: 3000 });
      const words = normalizeWords(res.data?.blockedWords || []);

      try {
        await Promise.all([
          AsyncStorage.setItem(CACHE_KEY, JSON.stringify(words)),
          AsyncStorage.setItem(CACHE_TS_KEY, String(Date.now())),
        ]);
      } catch {
        // ignore
      }

      return words;
    } catch {
      // cache fallback
    }

    try {
      const [cached, ts] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEY),
        AsyncStorage.getItem(CACHE_TS_KEY),
      ]);
      const tsNum = Number(ts || 0);
      if (cached && tsNum && Date.now() - tsNum < CACHE_TTL_MS) {
        return normalizeWords(JSON.parse(cached));
      }
      if (cached) return normalizeWords(JSON.parse(cached));
    } catch {
      // ignore
    }
    return [];
  },

  checkText: async (text) => {
    const t = normalizeTextForMatch(text);
    if (!t) return { ok: true };

    const words = await moderationService.getBlockedWords();
    for (const w of words) {
      const bw = normalizeTextForMatch(w);
      if (!bw) continue;

      // If it's a single token, do a word-boundary style match.
      // For phrases, fallback to substring match in normalized text.
      if (!bw.includes(" ")) {
        const parts = t.split(" ");
        if (parts.includes(bw)) return { ok: false, word: w };
      } else if (t.includes(bw)) {
        return { ok: false, word: w };
      }
    }
    return { ok: true };
  },
};
