import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import * as orderController from "../controllers/orderController";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  openDisputeSchema,
} from "../validators/routeSchemas";

const router = Router();

router.get("/", authenticate, orderController.listOrders);
router.post("/", authenticate, validate(createOrderSchema), orderController.createOrder);
router.get("/:id", authenticate, orderController.getOrder);
router.patch("/:id/status", authenticate, validate(updateOrderStatusSchema), orderController.updateStatus);
router.post("/:id/confirm-delivery", authenticate, orderController.confirmDelivery);
router.post("/:id/dispute", authenticate, validate(openDisputeSchema), orderController.openDispute);

export default router;
