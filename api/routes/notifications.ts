import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as notificationController from "../controllers/notificationController";

const router = Router();

router.get("/", authenticate, notificationController.listNotifications);
router.patch("/:id/read", authenticate, notificationController.markAsRead);
router.patch("/read-all", authenticate, notificationController.markAllAsRead);

export default router;
