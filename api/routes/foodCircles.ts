import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as controller from "../controllers/foodCircleController";

const router = Router();

// Circle routes
router.post("/", authenticate, controller.createCircleHandler);
router.get("/", authenticate, controller.listCirclesHandler);
router.get("/:id", authenticate, controller.getCircleHandler);
router.post("/:id/join", authenticate, controller.joinCircleHandler);
router.delete("/:id/leave", authenticate, controller.leaveCircleHandler);

// Group order routes within circles
router.post("/:id/group-orders", authenticate, controller.createGroupOrderHandler);
router.get("/:id/group-orders", authenticate, controller.listGroupOrdersHandler);

// Join a group order
router.post("/group-orders/:id/join", authenticate, controller.joinGroupOrderHandler);

export default router;
