import { Router } from "express";
import { authenticate, requireVerifiedVendor } from "../middleware/auth";
import { validate } from "../middleware/validate";
import * as bidController from "../controllers/bidController";
import { createBidSchema, updateBidSchema, counterBidSchema } from "../validators/routeSchemas";

const router = Router();

router.get("/", authenticate, bidController.listBids);
router.post("/", authenticate, requireVerifiedVendor, validate(createBidSchema), bidController.createBid);
router.get("/:id", authenticate, bidController.getBid);
router.patch("/:id", authenticate, requireVerifiedVendor, validate(updateBidSchema), bidController.updateBid);
router.patch("/:id/select", authenticate, bidController.selectBid);
router.patch("/:id/reject", authenticate, bidController.rejectBid);
router.patch("/:id/counter", authenticate, validate(counterBidSchema), bidController.counterBid);

export default router;
