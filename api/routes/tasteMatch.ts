import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as controller from "../controllers/tasteMatchController";

const router = Router();

router.get("/vendors", authenticate, controller.getMatchedVendors);
router.get("/vendor/:vendorId", authenticate, controller.getVendorMatch);
router.post("/refresh", authenticate, controller.refreshPreferences);

export default router;
