import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getBidRecommendation } from "../services/bidPricingService";

type AuthRequest = Request & { user?: { id: string; role: string } };

/**
 * GET /api/bid-pricing/recommendation/:requestId
 * Returns a bid recommendation for the vendor on a specific request.
 */
export const getBidRecommendationHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vendorId = req.user?.id;
  if (!vendorId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  if (req.user?.role !== "vendor") {
    res.status(403).json({ success: false, error: { message: "Vendor access only" } });
    return;
  }

  const recommendation = await getBidRecommendation(vendorId, req.params.requestId);
  res.json({ success: true, data: recommendation });
});
