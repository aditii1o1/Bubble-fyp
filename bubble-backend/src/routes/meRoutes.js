import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { meController } from "../controllers/meController.js";

const router = express.Router();

router.get("/", requireAuth, meController.getMe);
router.patch("/onboarding", requireAuth, meController.completeOnboarding);
router.patch("/profile", requireAuth, meController.updateProfile);

export default router;
