import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as escrowController from "../controllers/escrowController";

const router = Router();

router.get("/wallet", authenticate, escrowController.getWallet);
router.get("/transactions", authenticate, escrowController.getTransactions);
router.post("/deposit", authenticate, escrowController.deposit);
router.post("/withdraw", authenticate, escrowController.withdraw);

export default router;
