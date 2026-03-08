import mongoose from "mongoose";

const BroadcastSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Announcement" },
    message: { type: String, default: "" },
    createdByUid: { type: String, default: null },
    createdByEmail: { type: String, default: null }
  },
  { timestamps: true }
);

export const Broadcast = mongoose.model("Broadcast", BroadcastSchema);
