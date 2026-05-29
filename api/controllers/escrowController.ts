import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";

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

export const getTransactions = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

export const deposit = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { amount: req.body.amount, status: "deposited" } });
});

export const withdraw = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { amount: req.body.amount, status: "withdrawn" } });
});
