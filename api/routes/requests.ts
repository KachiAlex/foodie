import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as requestController from "../controllers/requestController";

const router = Router();

router.get("/", authenticate, requestController.listRequests);
router.post("/", authenticate, requestController.createRequest);
router.get("/:id", authenticate, requestController.getRequest);
router.patch("/:id/status", authenticate, requestController.updateStatus);
router.get("/:id/bids", authenticate, requestController.getRequestBids);

export default router;
