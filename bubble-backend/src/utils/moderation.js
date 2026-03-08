import { Settings } from "../models/Settings.js";

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getBlockedWords() {
  const settingsDoc = await Settings.findOne({ key: "moderation" }).lean();
  const list = Array.isArray(settingsDoc?.data?.blockedWords)
    ? settingsDoc.data.blockedWords
    : [];
  return list
    .map((w) => String(w || "").trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 200);
}

async function checkText(text) {
  const normalizedText = normalizeText(text);
  if (!normalizedText) return { ok: true };

  const blockedWords = await getBlockedWords();
  for (const blockedWord of blockedWords) {
    const normalizedBlockedWord = normalizeText(blockedWord);
    if (!normalizedBlockedWord) continue;

    if (!normalizedBlockedWord.includes(" ")) {
      const tokens = normalizedText.split(" ");
      if (tokens.includes(normalizedBlockedWord)) return { ok: false, word: blockedWord };
      continue;
    }

    if (normalizedText.includes(normalizedBlockedWord)) {
      return { ok: false, word: blockedWord };
    }
  }
  return { ok: true };
}

export { getBlockedWords, checkText };
