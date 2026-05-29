import { Router } from "express";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/sign-up", authController.signUp);
router.post("/sign-in", authController.signIn);
router.post("/refresh", authController.refreshToken);
router.post("/sign-out", authController.signOut);

export default router;
