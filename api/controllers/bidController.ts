import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";

export const listBids = asyncHandler(async (req: Request, res: Response) => {
  const requestId = req.query.requestId as string | undefined;
  const data = await prisma.bid.findMany({
    where: requestId ? { requestId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { id: true, name: true } },
      request: { select: { id: true, foodName: true, status: true } },
    },
  });
  res.json({ success: true, data });
});

export const createBid = asyncHandler(async (req: Request, res: Response) => {
  const { requestId, vendorId, bidAmount, prepTimeMinutes, estimatedDeliveryTime, message } = req.body;

  const bid = await prisma.bid.create({
    data: {
      requestId,
      vendorId,
      bidAmount: Number(bidAmount) || 0,
      prepTimeMinutes: Number(prepTimeMinutes) || 0,
      estimatedDeliveryTime,
      message,
      status: "active",
    },
    include: {
      vendor: { select: { id: true, name: true } },
      request: { select: { id: true, foodName: true } },
    },
  });

  res.status(201).json({ success: true, data: bid });
});

export const getBid = asyncHandler(async (req: Request, res: Response) => {
  const bid = await prisma.bid.findUnique({
    where: { id: req.params.id },
    include: {
      vendor: { select: { id: true, name: true } },
      request: { select: { id: true, foodName: true } },
    },
  });
  if (!bid) {
    res.status(404).json({ success: false, error: { message: "Bid not found" } });
    return;
  }
  res.json({ success: true, data: bid });
});

export const selectBid = asyncHandler(async (req: Request, res: Response) => {
  const selected = await prisma.bid.update({
    where: { id: req.params.id },
    data: { status: "selected" },
    include: {
      vendor: { select: { id: true, name: true } },
      request: { select: { id: true, foodName: true } },
    },
  });

  // Reject other bids on the same request
  await prisma.bid.updateMany({
    where: { requestId: selected.requestId, id: { not: selected.id } },
    data: { status: "rejected" },
  });

  // Update request status
  await prisma.foodRequest.update({
    where: { id: selected.requestId },
    data: { status: "bid_selected", selectedBidId: selected.id },
  });

  res.json({ success: true, data: selected });
});

export const rejectBid = asyncHandler(async (req: Request, res: Response) => {
  const bid = await prisma.bid.update({
    where: { id: req.params.id },
    data: { status: "rejected" },
    include: {
      vendor: { select: { id: true, name: true } },
      request: { select: { id: true, foodName: true } },
    },
  });
  res.json({ success: true, data: bid });
});
