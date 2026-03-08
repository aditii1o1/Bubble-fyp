import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { connectDb } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

import authRoutes from "./routes/authRoutes.js";
import meRoutes from "./routes/meRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import repostRoutes from "./routes/repostRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import moderationRoutes from "./routes/moderationRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendEnvPath = path.join(__dirname, "..", ".env");
const sharedEnvPath = path.join(__dirname, "..", "..", ".env");

// Prefer one shared root env for backend + frontend.
// Backward compatibility: if root `.env` is missing, fallback to backend `.env`.
const sharedEnvLoad = dotenv.config({ path: sharedEnvPath });
if (sharedEnvLoad.error) {
  dotenv.config({ path: backendEnvPath });
}

async function main() {
  await connectDb();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false }));
  app.use("/static", express.static(path.join(__dirname, "..", "public")));

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/me", meRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/reposts", repostRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/moderation", moderationRoutes);

  app.use(notFound);
  app.use(errorHandler);

  const port = parseInt(process.env.PORT, 10) || 4000;
  app.listen(port, () => {
    console.log(`Bubble backend listening on :${port}`);
  });
}

main().catch((err) => {
  console.error("Server failed:", err);
  process.exit(1);
});
