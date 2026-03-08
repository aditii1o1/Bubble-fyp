import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, default: "info" },
    text: { type: String, default: "" },
    fromNickname: { type: String, default: null },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    postId: { type: String, default: null },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", NotificationSchema);
