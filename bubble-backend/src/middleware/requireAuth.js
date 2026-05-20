import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const AUTH_USER_SELECT = {
  email: 1,
  role: 1,
  banned: 1,
  emailVerified: 1,
  onboarded: 1,
  username: 1,
  nickname: 1,
  bio: 1,
  avatar: 1,
  avatarUrl: 1,
  createdAt: 1,
};

async function requireAuth(req, res, next) {
  try {
    const authHeader =
      typeof req.headers.authorization === "string" ? req.headers.authorization : "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return res.status(401).json({ message: "Missing token" });

    const secret = process.env.JWT_ACCESS_SECRET || "";
    if (!secret) return res.status(500).json({ message: "Server not configured" });
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.sub).select(AUTH_USER_SELECT).lean();
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.banned) return res.status(403).json({ message: "Account restricted" });

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export { requireAuth };
