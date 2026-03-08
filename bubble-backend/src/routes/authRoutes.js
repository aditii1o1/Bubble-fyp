import express from "express";
import { authController } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", authController.register);
router.get("/verify-email", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

router.post("/request-password-reset", authController.requestPasswordReset);
router.get("/reset-password", authController.resetPasswordPage);
router.post("/reset-password", authController.resetPassword);
router.post("/reset-password-form", authController.resetPasswordForm);

export default router;
