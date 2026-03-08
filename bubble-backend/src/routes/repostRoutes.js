import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { repostsController } from "../controllers/repostsController.js";

const router = express.Router();

router.get("/user/:userId", requireAuth, repostsController.getUserReposts);
router.delete("/:id", requireAuth, repostsController.deleteRepost);

export default router;
