import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { notificationController } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", requireAuth, notificationController.getMyNotifications);
router.post("/:id/read", requireAuth, notificationController.markRead);
router.post("/read-all", requireAuth, notificationController.markAllRead);
router.post("/", requireAuth, notificationController.createNotification);

export default router;
