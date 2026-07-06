import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import * as escrowController from "../controllers/escrowController";
import {
  initiatePaymentSchema,
  withdrawSchema,
  legacyDepositSchema,
} from "../validators/routeSchemas";

const router = Router();

router.get("/wallet", authenticate, escrowController.getWallet);
router.get("/transactions", authenticate, escrowController.getTransactions);

// Paystack payment flow
router.post("/initiate-payment", authenticate, validate(initiatePaymentSchema), escrowController.initiatePayment);
router.post("/verify-payment", escrowController.verifyPayment);        // also used as webhook (no auth)
router.post("/release/:orderId", authenticate, escrowController.releaseEscrow);

// Wallet operations
router.post("/deposit", authenticate, validate(legacyDepositSchema), escrowController.deposit);
router.post("/withdraw", authenticate, validate(withdrawSchema), escrowController.withdraw);

export default router;
