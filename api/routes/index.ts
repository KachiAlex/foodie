import { Router } from "express";
import authRoutes from "./auth";
import requestRoutes from "./requests";
import bidRoutes from "./bids";
import orderRoutes from "./orders";
import vendorRoutes from "./vendors";
import adminRoutes from "./admin";
import escrowRoutes from "./escrow";
import notificationRoutes from "./notifications";
import vendorMarketRoutes from "./vendorMarket";

const router = Router();

router.use("/auth", authRoutes);
router.use("/requests", requestRoutes);
router.use("/bids", bidRoutes);
router.use("/orders", orderRoutes);
router.use("/vendors", vendorRoutes);
router.use("/admin", adminRoutes);
router.use("/escrow", escrowRoutes);
router.use("/notifications", notificationRoutes);
router.use("/community", vendorMarketRoutes);

export default router;
