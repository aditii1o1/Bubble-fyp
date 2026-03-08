import mongoose from "mongoose";
import { Comment } from "../models/Comment.js";
import { Post } from "../models/Post.js";
import { checkText } from "../utils/moderation.js";
import { CommentReaction } from "../models/CommentReaction.js";

function formatComment(commentDoc) {
  const legacy = commentDoc.reactions || {};
  const legacyTotal =
    Number(legacy.heart || 0) + Number(legacy.bulb || 0) + Number(legacy.hug || 0);

  return {
    id: String(commentDoc._id),
    bubbleId: String(commentDoc.postId),
    userId: String(commentDoc.userId),
    nickname: commentDoc.nickname || "@anonymous",
    avatar: commentDoc.avatar || "cat",
    avatarUrl: commentDoc.avatarUrl || null,
    text: commentDoc.text || "",
    createdAt: commentDoc.createdAt
      ? new Date(commentDoc.createdAt).toISOString()
      : new Date().toISOString(),
    reactions: { heart: legacyTotal },
  };
}

const commentController = {
  getComments: async (req, res, next) => {
    try {
      const postId = typeof req.params?.postId === "string" ? req.params.postId : "";
      const pageSize = Math.max(
        1,
        Math.min(100, parseInt(req.query?.pageSize, 10) || 50)
      );
      if (!mongoose.isValidObjectId(postId)) return res.json({ comments: [] });

      const commentDocs = await Comment.find({ postId })
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .lean();
      const commentIds = commentDocs.map((d) => d._id);
      const reactionDocs = await CommentReaction.find({
        userId: req.user._id,
        commentId: { $in: commentIds },
      }).lean();
      const likedSet = new Set(reactionDocs.map((r) => String(r.commentId)));

      const items = commentDocs.map((doc) => {
        const base = formatComment(doc);
        const myReaction = likedSet.has(String(doc._id)) ? "heart" : null;
        return { ...base, myReaction };
      });

      return res.json({ comments: items });
    } catch (e) {
      return next(e);
    }
  },

  addComment: async (req, res, next) => {
    try {
      if (!req.user?.onboarded) return res.status(403).json({ message: "Finish onboarding first" });

      const postId = typeof req.params?.postId === "string" ? req.params.postId : "";
      if (!mongoose.isValidObjectId(postId)) return res.status(400).json({ message: "Invalid post" });

      const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
      const check = await checkText(text);
      if (!check.ok) return res.status(400).json({ message: `This word is blocked: "${check.word}"` });

      const postExists = await Post.exists({ _id: postId });
      if (!postExists) return res.status(404).json({ message: "Post not found" });

      const createdComment = await Comment.create({
        postId,
        userId: req.user._id,
        nickname: req.user.nickname || "@anonymous",
        avatar: req.user.avatar || "cat",
        avatarUrl: req.user.avatarUrl || null,
        text,
        reactions: { heart: 0 },
      });

      await Post.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });

      return res.status(201).json({ comment: formatComment(createdComment.toObject()) });
    } catch (e) {
      return next(e);
    }
  },

  toggleCommentLike: async (req, res, next) => {
    try {
      const postId = typeof req.params?.postId === "string" ? req.params.postId : "";
      const commentId =
        typeof req.params?.commentId === "string" ? req.params.commentId : "";
      if (!mongoose.isValidObjectId(postId) || !mongoose.isValidObjectId(commentId)) {
        return res.status(400).json({ message: "Invalid comment" });
      }

      const commentDoc = await Comment.findOne({ _id: commentId, postId });
      if (!commentDoc) return res.status(404).json({ message: "Comment not found" });

      const existing = await CommentReaction.findOne({
        commentId,
        userId: req.user._id,
      });

      const current = Number(commentDoc.reactions?.heart || 0);

      if (existing) {
        await existing.deleteOne();
        commentDoc.reactions = { heart: Math.max(0, current - 1) };
        await commentDoc.save();
        return res.json({ reactions: { heart: Number(commentDoc.reactions.heart || 0) }, myReaction: null });
      }

      await CommentReaction.create({ commentId, userId: req.user._id, key: "heart" });
      commentDoc.reactions = { heart: current + 1 };
      await commentDoc.save();
      return res.json({ reactions: { heart: Number(commentDoc.reactions.heart || 0) }, myReaction: "heart" });
    } catch (e) {
      if (String(e?.code) === "11000") {
        return res.status(409).json({ message: "Already liked" });
      }
      return next(e);
    }
  },

  deleteComment: async (req, res, next) => {
    try {
      const postId = typeof req.params?.postId === "string" ? req.params.postId : "";
      const commentId =
        typeof req.params?.commentId === "string" ? req.params.commentId : "";
      if (!mongoose.isValidObjectId(postId) || !mongoose.isValidObjectId(commentId)) {
        return res.json({ ok: true });
      }

      const commentDoc = await Comment.findById(commentId);
      if (!commentDoc) return res.json({ ok: true });

      const isOwner = String(commentDoc.userId) === String(req.user._id);
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

      await CommentReaction.deleteMany({ commentId });
      await commentDoc.deleteOne();
      await Post.updateOne({ _id: postId }, { $inc: { commentCount: -1 } });
      return res.json({ ok: true });
    } catch (e) {
      return next(e);
    }
  }
};

export { commentController };
