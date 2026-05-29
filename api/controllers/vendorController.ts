import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";

export const getProfile = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      id: "ven-001",
      name: "Chef Nneka",
      rating: 4.8,
      specialty: "Nigerian",
      verified: true,
    },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: req.body });
});

export const getWallet = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      available: 45200,
      pending: 23800,
      totalEarned: 125600,
      currency: "NGN",
    },
  });
});

export const getVendorOrders = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

export const getMenu = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

export const addMenuItem = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: req.body });
});

export const getOpenRequests = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});
