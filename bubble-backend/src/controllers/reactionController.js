import mongoose from "mongoose";
import { Post } from "../models/Post.js";
import { PostReaction } from "../models/PostReaction.js";

const REACTION_KEYS = ["heart", "bulb", "hug"];

function normalizeReactionKey(key) {
  const nextKey = String(key || "").trim();
  return REACTION_KEYS.includes(nextKey) ? nextKey : "heart";
}

function getReactionCounts(reactions = {}) {
  return REACTION_KEYS.reduce((acc, key) => {
    const value = Number(reactions?.[key] || 0);
    acc[key] = Number.isFinite(value) ? value : 0;
    return acc;
  }, {});
}

const reactionController = {
  togglePostReaction: async (req, res, next) => {
    try {
      const postId = String(req.params?.postId || "");
      const reactionKey = normalizeReactionKey(req.body?.reactionKey);
      if (!mongoose.isValidObjectId(postId)) return res.status(400).json({ message: "Invalid post" });

      const postDoc = await Post.findById(postId);
      if (!postDoc) return res.status(404).json({ message: "Post not found" });

      const existingReactionDoc = await PostReaction.findOne({ postId, userId: req.user._id });
      const previousKey = existingReactionDoc ? normalizeReactionKey(existingReactionDoc.key) : null;
      const nextReactionKey = previousKey === reactionKey ? null : reactionKey;

      const reactions = getReactionCounts(postDoc.reactions);
      if (previousKey) {
        reactions[previousKey] = Math.max(0, Number(reactions[previousKey] || 0) - 1);
      }
      if (nextReactionKey) {
        reactions[nextReactionKey] = Number(reactions[nextReactionKey] || 0) + 1;
      }

      postDoc.reactions = reactions;
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
        map[String(reactionDoc.postId)] = normalizeReactionKey(reactionDoc.key);
      });
      return res.json({ map });
    } catch (e) {
      return next(e);
    }
  }
};

export { reactionController };
