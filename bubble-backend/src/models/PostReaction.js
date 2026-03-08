import mongoose from "mongoose";

const PostReactionSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    key: { type: String, enum: ["heart", "bulb", "hug"], required: true }
  },
  { timestamps: true }
);

PostReactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const PostReaction = mongoose.model("PostReaction", PostReactionSchema);
