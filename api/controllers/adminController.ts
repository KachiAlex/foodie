import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";

export const getDashboardMetrics = asyncHandler(async (_req: Request, res: Response) => {
  const [totalRequests, activeBids, escrowHeld, pendingDisputes, newVendors] = await Promise.all([
    prisma.foodRequest.count(),
    prisma.bid.count({ where: { status: "active" } }),
    prisma.escrowWallet.aggregate({ _sum: { pending: true } }),
    prisma.dispute.count({ where: { status: "open" } }),
    prisma.vendorProfile.count({ where: { verified: false } }),
  ]);

  res.json({
    success: true,
    data: {
      totalRequests,
      activeBids,
      escrowHeld: escrowHeld._sum.pending?.toNumber() || 0,
      pendingDisputes,
      newVendors,
    },
  });
});

export const listAllRequests = asyncHandler(async (_req: Request, res: Response) => {
  const data = await prisma.foodRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      bids: { include: { vendor: { select: { id: true, name: true } } } },
      order: true,
    },
  });
  res.json({ success: true, data });
});

export const listAllBids = asyncHandler(async (_req: Request, res: Response) => {
  const data = await prisma.bid.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { id: true, name: true } },
      request: { select: { id: true, foodName: true } },
    },
  });
  res.json({ success: true, data });
});

export const listAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  const data = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { id: true, name: true } },
      request: true,
      dispute: true,
    },
  });
  res.json({ success: true, data });
});

export const listEscrowTransactions = asyncHandler(async (_req: Request, res: Response) => {
  const data = await prisma.escrowTransaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { id: true, name: true } },
    },
  });
  res.json({ success: true, data });
});

export const releaseEscrow = asyncHandler(async (req: Request, res: Response) => {
  const tx = await prisma.escrowTransaction.update({
    where: { id: req.params.id },
    data: { status: "completed" },
  });
  res.json({ success: true, data: tx });
});

export const processRefund = asyncHandler(async (req: Request, res: Response) => {
  const tx = await prisma.escrowTransaction.update({
    where: { id: req.params.id },
    data: { status: "completed", type: "refund" },
  });
  res.json({ success: true, data: tx });
});

export const listDisputes = asyncHandler(async (_req: Request, res: Response) => {
  const data = await prisma.dispute.findMany({
    orderBy: { openedAt: "desc" },
    include: {
      order: true,
      openedBy: { select: { id: true, name: true } },
    },
  });
  res.json({ success: true, data });
});

export const resolveDispute = asyncHandler(async (req: Request, res: Response) => {
  const { resolution } = req.body;
  const dispute = await prisma.dispute.update({
    where: { id: req.params.id },
    data: {
      status: "resolved",
      resolution,
      resolvedAt: new Date(),
    },
    include: {
      order: true,
      openedBy: { select: { id: true, name: true } },
    },
  });
  res.json({ success: true, data: dispute });
});

export const listPendingVendors = asyncHandler(async (_req: Request, res: Response) => {
  const data = await prisma.vendorProfile.findMany({
    where: { verified: false },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  res.json({ success: true, data });
});

export const verifyVendor = asyncHandler(async (req: Request, res: Response) => {
  const profile = await prisma.vendorProfile.update({
    where: { userId: req.params.id },
    data: { verified: true },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  res.json({ success: true, data: profile });
});
