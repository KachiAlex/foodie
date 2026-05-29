import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as orderController from "../controllers/orderController";

const router = Router();

router.get("/", authenticate, orderController.listOrders);
router.post("/", authenticate, orderController.createOrder);
router.get("/:id", authenticate, orderController.getOrder);
router.patch("/:id/status", authenticate, orderController.updateStatus);
router.post("/:id/confirm-delivery", authenticate, orderController.confirmDelivery);
router.post("/:id/dispute", authenticate, orderController.openDispute);

export default router;
