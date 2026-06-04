import { Router } from "express";
import { authenticate, requireVerifiedVendor } from "../middleware/auth";
import * as vendorController from "../controllers/vendorController";

const router = Router();

router.get("/", vendorController.listVendors);
router.get("/search", vendorController.searchVendors);
router.get("/profile", authenticate, vendorController.getProfile);
router.patch("/profile", authenticate, requireVerifiedVendor, vendorController.updateProfile);
router.patch("/toggle-online", authenticate, requireVerifiedVendor, vendorController.toggleOnline);
router.get("/wallet", authenticate, vendorController.getWallet);
router.get("/orders", authenticate, vendorController.getVendorOrders);
router.get("/menu", authenticate, vendorController.getMenu);
router.post("/menu", authenticate, requireVerifiedVendor, vendorController.addMenuItem);
router.get("/open-requests", authenticate, vendorController.getOpenRequests);

export default router;
