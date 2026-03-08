import { User } from "../models/User.js";

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function isValidUsername(username) {
  return /^[a-z0-9_]{3,20}$/.test(username);
}

function publicMe(u) {
  return {
    id: String(u._id),
    email: u.email,
    role: u.role,
    banned: !!u.banned,
    emailVerified: !!u.emailVerified,
    onboarded: !!u.onboarded,
    username: u.username || "",
    nickname: u.nickname || "@anonymous",
    bio: u.bio || "",
    avatar: u.avatar || "cat",
    avatarUrl: u.avatarUrl || null
  };
}

const meController = {
  getMe: async (req, res, next) => {
    try {
      const me = await User.findById(req.user._id).lean();
      return res.json({ user: publicMe(me) });
    } catch (e) {
      return next(e);
    }
  },

  completeOnboarding: async (req, res, next) => {
    try {
      const me = await User.findById(req.user._id);
      if (!me) return res.status(404).json({ message: "User not found" });
      if (me.onboarded) return res.status(400).json({ message: "Onboarding already completed" });

      const desired = normalizeUsername(req.body?.username);
      if (!desired) return res.status(400).json({ message: "Username is required" });
      if (!isValidUsername(desired))
        return res.status(400).json({ message: "Use 3-20 letters/numbers/underscore only." });

      const exists = await User.findOne({ username: desired }).lean();
      if (exists) return res.status(400).json({ message: "That username is taken." });

      me.username = desired;
      me.usernameSet = true;
      me.nickname = `@${desired}`;

      me.bio = String(req.body?.bio || "").trim().slice(0, 140);
      me.avatar = String(req.body?.avatar || "cat").trim() || "cat";
      me.avatarUrl = req.body?.avatarUrl ? String(req.body.avatarUrl) : null;

      me.onboarded = true;
      await me.save();

      return res.json({ user: publicMe(me) });
    } catch (e) {
      if (String(e?.code) === "11000") {
        return res.status(400).json({ message: "That username is taken." });
      }
      return next(e);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const me = await User.findById(req.user._id);
      if (!me) return res.status(404).json({ message: "User not found" });

      if (typeof req.body?.bio === "string") {
        me.bio = String(req.body.bio).trim().slice(0, 140);
      }
      if (typeof req.body?.avatar === "string") {
        me.avatar = String(req.body.avatar).trim() || me.avatar;
      }
      if (typeof req.body?.avatarUrl === "string") {
        me.avatarUrl = String(req.body.avatarUrl).trim() || null;
      }

      await me.save();
      return res.json({ user: publicMe(me) });
    } catch (e) {
      return next(e);
    }
  }
};

export { meController };
