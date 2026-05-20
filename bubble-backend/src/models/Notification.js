import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, default: "info" },
    text: { type: String, default: "" },
    fromNickname: { type: String, default: null },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    postId: { type: String, default: null },
    eventKey: { type: String, default: null, index: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

NotificationSchema.index({ toUserId: 1, createdAt: -1 });
NotificationSchema.index({ toUserId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ toUserId: 1, eventKey: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", NotificationSchema);
