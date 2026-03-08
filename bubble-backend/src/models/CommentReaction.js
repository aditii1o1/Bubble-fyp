import mongoose from "mongoose";

const CommentReactionSchema = new mongoose.Schema(
  {
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    key: { type: String, enum: ["heart"], default: "heart" },
  },
  { timestamps: true }
);

CommentReactionSchema.index({ commentId: 1, userId: 1 }, { unique: true });

export const CommentReaction = mongoose.model("CommentReaction", CommentReactionSchema);

