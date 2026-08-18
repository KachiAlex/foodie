import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { z } from "zod";
import * as reviewController from "../controllers/reviewController";

const router = Router();

const createReviewSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  images: z.array(z.string().url()).optional(),
});

router.post("/", authenticate, validate(createReviewSchema), reviewController.createReview);
router.get("/vendor/:vendorId", reviewController.getVendorReviews);

export default router;
