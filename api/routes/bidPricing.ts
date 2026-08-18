import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as controller from "../controllers/bidPricingController";

const router = Router();

router.get("/recommendation/:requestId", authenticate, controller.getBidRecommendationHandler);

export default router;
