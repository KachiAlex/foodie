import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";

export const getWallet = asyncHandler(async (req: Request, res: Response) => {
  const vendorId = req.params.vendorId as string | undefined;
  const wallet = await prisma.escrowWallet.findUnique({
    where: { vendorId },
  });
  if (!wallet) {
    res.status(404).json({ success: false, error: { message: "Wallet not found" } });
    return;
  }
  res.json({ success: true, data: wallet });
});

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const vendorId = req.params.vendorId as string | undefined;
  const data = await prisma.escrowTransaction.findMany({
    where: vendorId ? { vendorId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { id: true, name: true } },
    },
  });
  res.json({ success: true, data });
});

export const deposit = asyncHandler(async (req: Request, res: Response) => {
  const { vendorId, amount, orderId } = req.body;
  const tx = await prisma.escrowTransaction.create({
    data: {
      vendorId,
      orderId,
      amount: Number(amount) || 0,
      type: "deposit",
      status: "completed",
    },
  });

  // Update wallet pending
  await prisma.escrowWallet.update({
    where: { vendorId },
    data: { pending: { increment: Number(amount) || 0 } },
  });

  res.json({ success: true, data: tx });
});

export const withdraw = asyncHandler(async (req: Request, res: Response) => {
  const { vendorId, amount } = req.body;
  const tx = await prisma.escrowTransaction.create({
    data: {
      vendorId,
      amount: Number(amount) || 0,
      type: "withdrawal",
      status: "completed",
    },
  });

  // Update wallet available
  await prisma.escrowWallet.update({
    where: { vendorId },
    data: {
      available: { decrement: Number(amount) || 0 },
      totalEarned: { increment: Number(amount) || 0 },
    },
  });

  res.json({ success: true, data: tx });
});
