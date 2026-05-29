import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as vendorController from "../controllers/vendorController";

const router = Router();

router.get("/profile", authenticate, vendorController.getProfile);
router.patch("/profile", authenticate, vendorController.updateProfile);
router.get("/wallet", authenticate, vendorController.getWallet);
router.get("/orders", authenticate, vendorController.getVendorOrders);
router.get("/menu", authenticate, vendorController.getMenu);
router.post("/menu", authenticate, vendorController.addMenuItem);
router.get("/open-requests", authenticate, vendorController.getOpenRequests);

export default router;
