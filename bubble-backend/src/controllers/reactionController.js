import mongoose from "mongoose";
import { Post } from "../models/Post.js";
import { PostReaction } from "../models/PostReaction.js";

function safeKey(k) {
  return String(k || "").trim();
}

const reactionController = {
  togglePostReaction: async (req, res, next) => {
    try {
      const postId = String(req.params?.postId || "");
      const reactionKey = "heart";
      if (!mongoose.isValidObjectId(postId)) return res.status(400).json({ message: "Invalid post" });

      const postDoc = await Post.findById(postId);
      if (!postDoc) return res.status(404).json({ message: "Post not found" });

      const existingReactionDoc = await PostReaction.findOne({ postId, userId: req.user._id });
      const hasAnyReaction = Boolean(existingReactionDoc);
      const nextReactionKey = hasAnyReaction ? null : reactionKey;

      const reactions = {
        heart: Number(postDoc.reactions?.heart || 0),
      };

      if (hasAnyReaction) {
        reactions.heart = Math.max(0, Number(reactions.heart || 0) - 1);
      }
      if (nextReactionKey) reactions.heart = Number(reactions.heart || 0) + 1;

      postDoc.reactions = { heart: reactions.heart };
      await postDoc.save();

      if (nextReactionKey) {
        await PostReaction.updateOne(
          { postId, userId: req.user._id },
          { $set: { key: nextReactionKey } },
          { upsert: true }
        );
      } else if (existingReactionDoc) {
        await existingReactionDoc.deleteOne();
      }

      return res.json({ reactions, myReaction: nextReactionKey });
    } catch (e) {
      return next(e);
    }
  },

  getMyReactionsMap: async (req, res, next) => {
    try {
      const postIds = Array.isArray(req.body?.postIds)
        ? req.body.postIds.map((id) => String(id || "")).filter(Boolean)
        : [];
      if (postIds.length === 0) return res.json({ map: {} });

      const objIds = postIds.filter((id) => mongoose.isValidObjectId(id));
      const reactionDocs = await PostReaction.find({
        userId: req.user._id,
        postId: { $in: objIds },
      }).lean();
      const map = {};
      reactionDocs.forEach((reactionDoc) => {
        map[String(reactionDoc.postId)] = "heart";
      });
      return res.json({ map });
    } catch (e) {
      return next(e);
    }
  }
};

export { reactionController };
