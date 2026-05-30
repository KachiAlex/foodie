import { Router } from "express";
import { authenticate, requireVerifiedVendor } from "../middleware/auth";
import * as bidController from "../controllers/bidController";

const router = Router();

router.get("/", authenticate, bidController.listBids);
router.post("/", authenticate, requireVerifiedVendor, bidController.createBid);
router.get("/:id", authenticate, bidController.getBid);
router.patch("/:id/select", authenticate, bidController.selectBid);
router.patch("/:id/reject", authenticate, bidController.rejectBid);

export default router;
