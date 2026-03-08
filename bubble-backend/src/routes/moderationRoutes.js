import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { moderationController } from "../controllers/moderationController.js";

const router = express.Router();

router.get("/blocked-words", requireAuth, moderationController.getBlockedWords);

export default router;
