import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as escrowController from "../controllers/escrowController";

const router = Router();

router.get("/wallet", authenticate, escrowController.getWallet);
router.get("/transactions", authenticate, escrowController.getTransactions);

// Paystack payment flow
router.post("/initiate-payment", authenticate, escrowController.initiatePayment);
router.post("/verify-payment", escrowController.verifyPayment);        // also used as webhook (no auth)
router.post("/release/:orderId", authenticate, escrowController.releaseEscrow);

// Wallet operations
router.post("/deposit", authenticate, escrowController.deposit);
router.post("/withdraw", authenticate, escrowController.withdraw);

export default router;
