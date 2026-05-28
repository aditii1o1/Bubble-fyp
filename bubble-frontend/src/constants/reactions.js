// Shared reaction options for posts + comments.
// Keep keys stable because they are stored in Firestore.
export const REACTION_OPTIONS = [
  { key: "heart", emoji: "\u2764\uFE0F", label: "Love" },
  { key: "bulb", emoji: "\uD83D\uDCA1", label: "Insightful" },
  { key: "hug", emoji: "\uD83E\uDD17", label: "Support" },
];

export const DEFAULT_REACTION_COUNTS = REACTION_OPTIONS.reduce((acc, item) => {
  acc[item.key] = 0;
  return acc;
}, {});

export function normalizeReactionKey(key) {
  const nextKey = String(key || "").trim();
  return REACTION_OPTIONS.some((item) => item.key === nextKey) ? nextKey : "heart";
}
