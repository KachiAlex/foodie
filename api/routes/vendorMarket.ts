import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import * as controller from "../controllers/vendorMarketController";
import {
  vendorMarketOfferSchema,
  updateVendorMarketOfferSchema,
} from "../validators/routeSchemas";

const router = Router();

router.get("/vendors", controller.listVendorMarket);
router.get("/offers", authenticate, controller.listOffers);
router.post("/offers", authenticate, validate(vendorMarketOfferSchema), controller.createOffer);
router.patch("/offers/:id", authenticate, validate(updateVendorMarketOfferSchema), controller.updateOffer);

export default router;
