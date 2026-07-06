import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import * as authController from "../controllers/authController";
import {
  signUpSchema,
  signInSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "../validators/authSchemas";

const router = Router();

router.post("/sign-up", validate(signUpSchema), authController.signUp);
router.post("/sign-in", validate(signInSchema), authController.signIn);
router.post("/request-password-reset", validate(requestPasswordResetSchema), authController.requestPasswordReset);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.post("/refresh", authenticate, authController.refreshToken);
router.post("/sign-out", authController.signOut);

export default router;
