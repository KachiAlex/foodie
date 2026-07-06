import { Router } from "express";
import { authenticate, requireVerifiedVendor } from "../middleware/auth";
import { validate } from "../middleware/validate";
import * as vendorController from "../controllers/vendorController";
import {
  updateVendorProfileSchema,
  addMenuItemSchema,
  uploadVendorDocumentSchema,
} from "../validators/routeSchemas";

const router = Router();

router.get("/", vendorController.listVendors);
router.get("/search", vendorController.searchVendors);
router.get("/profile", authenticate, vendorController.getProfile);
router.patch("/profile", authenticate, requireVerifiedVendor, validate(updateVendorProfileSchema), vendorController.updateProfile);
router.patch("/toggle-online", authenticate, vendorController.toggleOnline);
router.get("/wallet", authenticate, vendorController.getWallet);
router.get("/orders", authenticate, vendorController.getVendorOrders);
router.get("/menu", authenticate, vendorController.getMenu);
router.post("/menu", authenticate, requireVerifiedVendor, validate(addMenuItemSchema), vendorController.addMenuItem);
router.get("/documents", authenticate, vendorController.getDocuments);
router.post("/documents", authenticate, validate(uploadVendorDocumentSchema), vendorController.uploadDocument);
router.get("/open-requests", authenticate, vendorController.getOpenRequests);

export default router;
