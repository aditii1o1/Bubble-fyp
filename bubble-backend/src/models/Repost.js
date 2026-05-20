import mongoose from "mongoose";

const RepostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    originalBubbleId: { type: String, required: true },
    originalText: { type: String, default: "" },
    overlayText: { type: String, default: "" },
    originalAuthor: { type: String, default: "@anonymous" }
  },
  { timestamps: true }
);

RepostSchema.index({ userId: 1, createdAt: -1 });

export const Repost = mongoose.model("Repost", RepostSchema);
