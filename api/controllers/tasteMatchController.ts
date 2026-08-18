import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { updateBuyerPreferences, getVendorMatchScores, calculateMatchScore } from "../services/tasteMatchService";

type AuthRequest = Request & { user?: { id: string; role: string } };

/**
 * GET /api/taste-match/vendors
 * Returns all verified vendors with match scores for the authenticated buyer.
 */
export const getMatchedVendors = asyncHandler(async (req: AuthRequest, res: Response) => {
  const buyerId = req.user?.id;
  if (!buyerId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  const scores = await getVendorMatchScores(buyerId);
  res.json({ success: true, data: scores });
});

/**
 * GET /api/taste-match/vendor/:vendorId
 * Returns the match score for a specific vendor.
 */
export const getVendorMatch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const buyerId = req.user?.id;
  if (!buyerId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  const score = await calculateMatchScore(buyerId, req.params.vendorId);
  res.json({ success: true, data: { matchScore: score } });
});

/**
 * POST /api/taste-match/refresh
 * Recalculates the buyer's preference profile from order history.
 */
export const refreshPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const buyerId = req.user?.id;
  if (!buyerId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  await updateBuyerPreferences(buyerId);
  res.json({ success: true, message: "Preferences updated" });
});
