import { User } from "../models/User.js";

function publicUser(userDoc, { includeAdminFields = false } = {}) {
  return {
    id: String(userDoc._id),
    nickname: userDoc.nickname || "@anonymous",
    username: userDoc.username || "",
    bio: userDoc.bio || "",
    avatar: userDoc.avatar || "cat",
    avatarUrl: userDoc.avatarUrl || null,
    banned: includeAdminFields ? !!userDoc.banned : undefined,
    createdAt: userDoc.createdAt ? new Date(userDoc.createdAt).toISOString() : null,
    updatedAt: userDoc.updatedAt ? new Date(userDoc.updatedAt).toISOString() : null,
  };
}

const usersController = {
  getUserProfile: async (req, res, next) => {
    try {
      const userId = String(req.params?.id || "").trim();
      if (!userId) return res.status(400).json({ message: "Missing user id" });

      const userDoc = await User.findById(userId).lean();
      if (!userDoc) return res.status(404).json({ message: "User not found" });

      const includeAdminFields =
        String(req.user?._id || "") === String(userDoc._id || "") || req.user?.role === "admin";

      return res.json({ user: publicUser(userDoc, { includeAdminFields }) });
    } catch (e) {
      return next(e);
    }
  },
};

export { usersController };
