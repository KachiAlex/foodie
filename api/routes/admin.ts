import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import * as adminController from "../controllers/adminController";
import {
  resolveDisputeSchema,
  flagVendorSchema,
  reviewDocumentSchema,
} from "../validators/routeSchemas";

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
router.patch("/disputes/:id/resolve", validate(resolveDisputeSchema), adminController.resolveDispute);
router.get("/vendors/pending", adminController.listPendingVendors);
router.get("/vendors/:id/documents", adminController.getVendorDocuments);
router.patch("/vendors/:id/verify", adminController.verifyVendor);
router.post("/vendors/:id/audit", adminController.triggerVendorAudit);
router.post("/vendors/:id/flag", validate(flagVendorSchema), adminController.flagVendor);
router.patch("/documents/:id/approve", adminController.approveDocument);
router.patch("/documents/:id/reject", validate(reviewDocumentSchema), adminController.rejectDocument);

export default router;
