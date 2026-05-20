import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { usersController } from "../controllers/usersController.js";

const router = express.Router();

router.get("/:id", requireAuth, usersController.getUserProfile);

export default router;
