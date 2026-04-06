import express from "express";
import { donationController } from "../controllers/donationController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/initiate", requireAuth, donationController.initiate);
router.post("/verify", requireAuth, donationController.verify);

export default router;
