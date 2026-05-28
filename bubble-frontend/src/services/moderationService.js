import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./apiClient";

const CACHE_KEY = "@blocked_words";
const CACHE_TS_KEY = "@blocked_words_ts";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
let memoryWords = null;
let memoryTs = 0;
let refreshPromise = null;

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

function findBlockedWord(text, words) {
  const t = normalizeTextForMatch(text);
  if (!t) return null;

  for (const w of words) {
    const bw = normalizeTextForMatch(w);
    if (!bw) continue;

    if (!bw.includes(" ")) {
      const parts = t.split(" ");
      if (parts.includes(bw)) return w;
    } else if (t.includes(bw)) {
      return w;
    }
  }

  return null;
}

function isFresh(ts) {
  return Number.isFinite(ts) && ts > 0 && Date.now() - ts < CACHE_TTL_MS;
}

function setMemoryCache(words, ts = Date.now()) {
  memoryWords = normalizeWords(words);
  memoryTs = ts;
  return memoryWords;
}

async function persistWords(words) {
  const next = setMemoryCache(words, Date.now());
  try {
    await Promise.all([
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next)),
      AsyncStorage.setItem(CACHE_TS_KEY, String(memoryTs)),
    ]);
  } catch {
    // ignore cache write failures
  }
  return next;
}

async function readStoredWords() {
  try {
    const [cached, ts] = await Promise.all([
      AsyncStorage.getItem(CACHE_KEY),
      AsyncStorage.getItem(CACHE_TS_KEY),
    ]);
    if (!cached) return { words: null, ts: 0 };
    const words = normalizeWords(JSON.parse(cached));
    const tsNum = Number(ts || 0);
    setMemoryCache(words, tsNum);
    return { words, ts: tsNum };
  } catch {
    return { words: null, ts: 0 };
  }
}

async function fetchRemoteWords() {
  const res = await api.get("/moderation/blocked-words", { timeout: 3000 });
  const words = normalizeWords(res.data?.blockedWords || []);
  return persistWords(words);
}

function refreshBlockedWords() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        return await fetchRemoteWords();
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export const moderationService = {
  getBlockedWords: async ({ preferFresh = false } = {}) => {
    if (memoryWords !== null) {
      const words = normalizeWords(memoryWords);
      if (isFresh(memoryTs) || !preferFresh) {
        if (!isFresh(memoryTs)) {
          void refreshBlockedWords().catch(() => {
            // ignore background refresh failures
          });
        }
        return words;
      }
    }

    const stored = await readStoredWords();
    if (stored.words !== null) {
      if (isFresh(stored.ts) || !preferFresh) {
        if (!isFresh(stored.ts)) {
          void refreshBlockedWords().catch(() => {
            // ignore background refresh failures
          });
        }
        return stored.words;
      }
    }

    try {
      return await refreshBlockedWords();
    } catch {
      if (memoryWords !== null) return normalizeWords(memoryWords);
    }
    return [];
  },

  prefetchBlockedWords: async () => {
    try {
      await moderationService.getBlockedWords({ preferFresh: true });
    } catch {
      // ignore warmup failures
    }
  },

  checkText: async (text) => {
    const words = await moderationService.getBlockedWords();
    const blockedWord = findBlockedWord(text, words);
    if (blockedWord) return { ok: false, word: blockedWord };
    return { ok: true };
  },

  checkTexts: async (entries = []) => {
    const words = await moderationService.getBlockedWords();
    for (const entry of Array.isArray(entries) ? entries : []) {
      const field = String(entry?.field || "").trim();
      const blockedWord = findBlockedWord(entry?.text, words);
      if (blockedWord) return { ok: false, field, word: blockedWord };
    }
    return { ok: true };
  },
};
