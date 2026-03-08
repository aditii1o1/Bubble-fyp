import mongoose from "mongoose";
import { Post } from "../models/Post.js";
import { checkText } from "../utils/moderation.js";
import { PostReaction } from "../models/PostReaction.js";

function formatPost(postDoc) {
  const legacy = postDoc.reactions || {};
  const legacyTotal =
    Number(legacy.heart || 0) + Number(legacy.bulb || 0) + Number(legacy.hug || 0);

  return {
    id: String(postDoc._id),
    userId: String(postDoc.userId),
    nickname: postDoc.nickname || "@anonymous",
    avatar: postDoc.avatar || "cat",
    avatarUrl: postDoc.avatarUrl || null,
    title: postDoc.title || "",
    text: postDoc.text || "",
    tags: Array.isArray(postDoc.tags) ? postDoc.tags : [],
    reactions: { heart: legacyTotal },
    commentCount: Number(postDoc.commentCount || 0),
    comments: Number(postDoc.commentCount || 0),
    viewCount: Number(postDoc.viewCount || 0),
    createdAt: postDoc.createdAt ? new Date(postDoc.createdAt).toISOString() : new Date().toISOString(),
    expiresAt: postDoc.expiresAt ? new Date(postDoc.expiresAt).toISOString() : new Date(Date.now() + 86400000).toISOString(),
  };
}

function cleanTags(inputTags, maxTags = 3) {
  const rawList = Array.isArray(inputTags) ? inputTags : [];
  const tags = [];

  for (const rawTag of rawList) {
    if (typeof rawTag !== "string") continue;
    let tag = rawTag.trim().toLowerCase();
    if (!tag) continue;
    if (tag.startsWith("#")) tag = tag.slice(1);

    tag = tag.replace(/[^a-z0-9_]/g, "");
    if (!tag) continue;
    if (tag.length > 30) tag = tag.slice(0, 30);

    if (!tags.includes(tag)) tags.push(tag);
    if (tags.length >= maxTags) break;
  }

  return tags;
}

const postController = {
  getFeed: async (req, res, next) => {
    try {
      const pageSize = Math.max(
        1,
        Math.min(50, parseInt(req.query?.pageSize, 10) || 20)
      );
      const now = new Date();

      const postDocs = await Post.find({ expiresAt: { $gt: now } })
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .lean();

      const posts = postDocs.map((postDoc) => formatPost(postDoc));
      return res.json({ posts });
    } catch (e) {
      return next(e);
    }
  },

  getUserPosts: async (req, res, next) => {
    try {
      const pageSize = Math.max(
        1,
        Math.min(50, parseInt(req.query?.pageSize, 10) || 20)
      );
      const userId = typeof req.params?.userId === "string" ? req.params.userId : "";
      if (!mongoose.isValidObjectId(userId)) return res.json({ posts: [] });

      const now = new Date();
      const postDocs = await Post.find({ userId, expiresAt: { $gt: now } })
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .lean();
      const posts = postDocs.map((postDoc) => formatPost(postDoc));
      return res.json({ posts });
    } catch (e) {
      return next(e);
    }
  },

  getPostById: async (req, res, next) => {
    try {
      const postId = typeof req.params?.postId === "string" ? req.params.postId : "";
      const postDoc = await Post.findById(postId).lean();
      if (!postDoc) return res.status(404).json({ message: "Post not found" });
      return res.json({ post: formatPost(postDoc) });
    } catch (e) {
      return next(e);
    }
  },

  createPost: async (req, res, next) => {
    try {
      if (!req.user?.onboarded) return res.status(403).json({ message: "Finish onboarding first" });

      const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
      const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
      const tags = cleanTags(req.body?.tags, 3);
      if (tags.length === 0) {
        return res.status(400).json({ message: "Select at least 1 tag" });
      }

      const check = await checkText(`${title} ${text}`);
      if (!check.ok) return res.status(400).json({ message: `This word is blocked: "${check.word}"` });

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const createdPost = await Post.create({
        userId: req.user._id,
        nickname: req.user.nickname || "@anonymous",
        avatar: req.user.avatar || "cat",
        avatarUrl: req.user.avatarUrl || null,
        title,
        text,
        tags,
        expiresAt
      });

      return res.status(201).json({ post: formatPost(createdPost.toObject()) });
    } catch (e) {
      return next(e);
    }
  },

  deletePost: async (req, res, next) => {
    try {
      const postId = typeof req.params?.postId === "string" ? req.params.postId : "";
      const postDoc = await Post.findById(postId);
      if (!postDoc) return res.json({ ok: true });

      const isOwner = String(postDoc.userId) === String(req.user._id);
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

      await Promise.all([
        postDoc.deleteOne(),
        PostReaction.deleteMany({ postId }),
      ]);
      return res.json({ ok: true });
    } catch (e) {
      return next(e);
    }
  }
};

export { postController };
