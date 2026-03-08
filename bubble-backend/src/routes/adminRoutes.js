import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { adminController } from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", requireAuth, requireAdmin, adminController.getDashboardCounts);
router.get("/users", requireAuth, requireAdmin, adminController.getUsers);
router.patch("/users/:id/ban", requireAuth, requireAdmin, adminController.banUser);
router.patch("/users/:id/unban", requireAuth, requireAdmin, adminController.unbanUser);

router.get("/moderation", requireAuth, requireAdmin, adminController.getModeration);
router.put("/moderation", requireAuth, requireAdmin, adminController.setModeration);

router.get("/broadcasts", requireAuth, requireAdmin, adminController.getBroadcasts);
router.post("/broadcasts", requireAuth, requireAdmin, adminController.sendBroadcast);

router.get("/reports", requireAuth, requireAdmin, adminController.getReports);
router.get("/reports/:id", requireAuth, requireAdmin, adminController.getReportById);
router.post("/reports", requireAuth, adminController.createReport);
router.patch("/reports/:id/resolve", requireAuth, requireAdmin, adminController.resolveReport);
router.patch("/reports/:id/deleted", requireAuth, requireAdmin, adminController.markReportDeleted);

router.delete("/posts/:id", requireAuth, requireAdmin, adminController.deletePost);
router.delete("/comments/:id", requireAuth, requireAdmin, adminController.deleteComment);

export default router;
