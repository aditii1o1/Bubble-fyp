import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    nickname: { type: String, default: "@anonymous" },
    avatar: { type: String, default: "cat" },
    avatarUrl: { type: String, default: null },
    text: { type: String, default: "" },
    reactions: {
      heart: { type: Number, default: 0 },
    }
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", CommentSchema);
