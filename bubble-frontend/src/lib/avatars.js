// Central place for avatar options so the same emojis show everywhere.
export const AVATAR_EMOJIS = {
  cat: "😸",
  dog: "🐶",
  panda: "🐼",
  rabbit: "🐰",
  fox: "🦊",
  bear: "🐻",
  penguin: "🐧",
  owl: "🦉",
  dolphin: "🐬",
  unicorn: "🦄",
  butterfly: "🦋",
  koala: "🐨",
  sloth: "🦥",
  raccoon: "🦝",
  default: "👤",
};

export function getAvatarEmoji(avatarKey) {
  return AVATAR_EMOJIS[avatarKey] || AVATAR_EMOJIS.default;
}

