import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    emailVerified: { type: Boolean, default: false },
    verifyEmailTokenHash: { type: String, default: null },
    verifyEmailTokenExpiresAt: { type: Date, default: null },

    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordTokenExpiresAt: { type: Date, default: null },

    role: { type: String, enum: ["user", "admin"], default: "user" },
    banned: { type: Boolean, default: false },

    onboarded: { type: Boolean, default: false },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    usernameSet: { type: Boolean, default: false },
    nickname: { type: String, default: "@anonymous" },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "cat" },
    avatarUrl: { type: String, default: null }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
