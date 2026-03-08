import { getBlockedWords } from "../utils/moderation.js";

const moderationController = {
  getBlockedWords: async (req, res, next) => {
    try {
      const words = await getBlockedWords();
      return res.json({ blockedWords: words });
    } catch (e) {
      return next(e);
    }
  },
};

export { moderationController };
