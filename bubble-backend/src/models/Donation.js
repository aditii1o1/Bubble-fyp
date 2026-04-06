import mongoose from "mongoose";

const DonationSchema = new mongoose.Schema(
  {
    provider: { type: String, default: "khalti" },
    status: { type: String, default: "Initiated" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, default: "" },
    userNickname: { type: String, default: "" },
    userUsername: { type: String, default: "" },
    donorName: { type: String, default: "" },
    amount: { type: Number, required: true }, // NPR
    currency: { type: String, default: "NPR" },
    purchaseOrderId: { type: String, default: "" },
    purchaseOrderName: { type: String, default: "" },
    pidx: { type: String, index: true, unique: true, sparse: true },
    transactionId: { type: String, default: "" },
    totalAmount: { type: Number, default: null },
    fee: { type: Number, default: null },
    refunded: { type: Boolean, default: false },
    demo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DonationSchema.index({ createdAt: -1 });
DonationSchema.index({ userId: 1, createdAt: -1 });
DonationSchema.index({ status: 1, createdAt: -1 });
DonationSchema.index({ donorName: 1, createdAt: -1 });

export const Donation = mongoose.model("Donation", DonationSchema);
