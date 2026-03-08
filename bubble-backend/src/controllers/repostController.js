import mongoose from "mongoose";
import { Repost } from "../models/Repost.js";
import { checkText } from "../utils/moderation.js";

function formatRepost(repostDoc) {
  return {
    id: String(repostDoc._id),
    userId: String(repostDoc.userId),
    originalBubbleId: String(repostDoc.originalBubbleId || ""),
    originalText: repostDoc.originalText || "",
    overlayText: repostDoc.overlayText || "",
    timeAgo: "just now",
    originalAuthor: repostDoc.originalAuthor || "@anonymous",
    createdAt: repostDoc.createdAt ? new Date(repostDoc.createdAt).toISOString() : new Date().toISOString(),
  };
}

const repostController = {
  createRepost: async (req, res, next) => {
    try {
      if (!req.user?.onboarded) return res.status(403).json({ message: "Finish onboarding first" });

      const postId = typeof req.params?.postId === "string" ? req.params.postId : "";
      if (!postId) return res.status(400).json({ message: "Missing post" });

      const overlayText =
        typeof req.body?.overlayText === "string" ? req.body.overlayText.trim() : "";
      const check = await checkText(overlayText);
      if (!check.ok) return res.status(400).json({ message: `This word is blocked: "${check.word}"` });

      const payload = {
        userId: req.user._id,
        originalBubbleId: postId,
        originalText: typeof req.body?.originalText === "string" ? req.body.originalText : "",
        overlayText,
        originalAuthor:
          typeof req.body?.originalAuthor === "string" ? req.body.originalAuthor : "@anonymous"
      };

      const createdRepost = await Repost.create(payload);
      return res.status(201).json({ repost: formatRepost(createdRepost.toObject()) });
    } catch (e) {
      return next(e);
    }
  }
};

export { repostController };
