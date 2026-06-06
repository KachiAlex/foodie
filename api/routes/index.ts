import { Router } from "express";
import authRoutes from "./auth";
import requestRoutes from "./requests";
import bidRoutes from "./bids";
import orderRoutes from "./orders";
import vendorRoutes from "./vendors";
import adminRoutes from "./admin";
import escrowRoutes from "./escrow";
import notificationRoutes from "./notifications";

const router = Router();

router.use("/auth", authRoutes);
router.use("/requests", requestRoutes);
router.use("/bids", bidRoutes);
router.use("/orders", orderRoutes);
router.use("/vendors", vendorRoutes);
router.use("/admin", adminRoutes);
router.use("/escrow", escrowRoutes);
router.use("/notifications", notificationRoutes);

export default router;
