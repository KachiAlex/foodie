import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import * as adminController from "../controllers/adminController";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/dashboard", adminController.getDashboardMetrics);
router.get("/requests", adminController.listAllRequests);
router.get("/bids", adminController.listAllBids);
router.get("/orders", adminController.listAllOrders);
router.get("/escrow", adminController.listEscrowTransactions);
router.patch("/escrow/:id/release", adminController.releaseEscrow);
router.patch("/escrow/:id/refund", adminController.processRefund);
router.get("/disputes", adminController.listDisputes);
router.patch("/disputes/:id/resolve", adminController.resolveDispute);
router.get("/vendors/pending", adminController.listPendingVendors);
router.patch("/vendors/:id/verify", adminController.verifyVendor);

export default router;
