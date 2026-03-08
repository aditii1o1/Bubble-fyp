import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ["open", "resolved", "deleted"], default: "open", index: true },
    targetType: { type: String, enum: ["post", "comment"], default: "post" },
    targetId: { type: String, required: true },
    targetPostId: { type: String, default: null },
    targetText: { type: String, default: "" },
    reason: { type: String, default: "" },
    description: { type: String, default: "" },
    reporterId: { type: String, default: "" },
    reporterEmail: { type: String, default: "" },
    reporterNickname: { type: String, default: "" },
    reportedUserId: { type: String, default: "" },
    reportedUserNickname: { type: String, default: "" },
    resolvedAt: { type: Date, default: null },
    actionTaken: { type: String, default: null }
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", ReportSchema);
