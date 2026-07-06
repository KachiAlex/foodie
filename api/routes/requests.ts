import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import * as requestController from "../controllers/requestController";
import { createRequestSchema, updateRequestStatusSchema } from "../validators/routeSchemas";

const router = Router();

router.get("/", authenticate, requestController.listRequests);
router.post("/", authenticate, validate(createRequestSchema), requestController.createRequest);
router.get("/:id", authenticate, requestController.getRequest);
router.patch("/:id/status", authenticate, validate(updateRequestStatusSchema), requestController.updateStatus);
router.get("/:id/bids", authenticate, requestController.getRequestBids);

export default router;
