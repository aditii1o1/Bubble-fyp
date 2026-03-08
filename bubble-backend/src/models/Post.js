import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    nickname: { type: String, default: "@anonymous" },
    avatar: { type: String, default: "cat" },
    avatarUrl: { type: String, default: null },

    title: { type: String, default: "" },
    text: { type: String, default: "" },
    tags: { type: [String], default: [] },

    reactions: {
      heart: { type: Number, default: 0 },
    },
    commentCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", PostSchema);
