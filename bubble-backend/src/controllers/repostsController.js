import mongoose from "mongoose";
import { Repost } from "../models/Repost.js";

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

const repostsController = {
  getUserReposts: async (req, res, next) => {
    try {
      const userId = typeof req.params?.userId === "string" ? req.params.userId : "";
      const pageSize = Math.max(
        1,
        Math.min(50, parseInt(req.query?.pageSize, 10) || 20)
      );
      if (!mongoose.isValidObjectId(userId)) return res.json({ reposts: [] });

      const repostDocs = await Repost.find({ userId })
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .lean();
      return res.json({ reposts: repostDocs.map((doc) => formatRepost(doc)) });
    } catch (e) {
      return next(e);
    }
  },

  deleteRepost: async (req, res, next) => {
    try {
      const id = typeof req.params?.id === "string" ? req.params.id : "";
      const repostDoc = await Repost.findById(id);
      if (!repostDoc) return res.json({ ok: true });

      const isOwner = String(repostDoc.userId) === String(req.user._id);
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

      await repostDoc.deleteOne();
      return res.json({ ok: true });
    } catch (e) {
      return next(e);
    }
  },
};

export { repostsController };
