import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";
import type { AuthUser } from "../middleware/auth";

async function notify(userId: string, title: string, body: string, type: string) {
  try {
    await prisma.notification.create({
      data: { userId, title, body, type },
    });
  } catch {
    // silent fail — notifications should not break business logic
  }
}

export const listBids = asyncHandler(async (req: Request, res: Response) => {
  const requestId = req.query.requestId as string | undefined;
  const data = await prisma.bid.findMany({
    where: requestId ? { requestId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { id: true, name: true, vendorProfile: true } },
      request: { select: { id: true, foodName: true, status: true } },
    },
  });
  res.json({ success: true, data });
});

export const createBid = asyncHandler(async (req: Request, res: Response) => {
  const { requestId, bidAmount, prepTimeMinutes, estimatedDeliveryTime, message } = req.body;
  const authUser = (req as Request & { user?: AuthUser }).user!;

  const request = await prisma.foodRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    res.status(404).json({ success: false, error: { message: "Request not found" } });
    return;
  }
  if (request.status !== "open") {
    res.status(400).json({ success: false, error: { message: "Request is no longer open for bids" } });
    return;
  }

  const bid = await prisma.bid.create({
    data: {
      requestId,
      vendorId: authUser.id,
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

  await notify(
    request.buyerId,
    "New bid received",
    `${authUser.name} placed a ₦${Number(bidAmount).toLocaleString()} bid on "${request.foodName}"`,
    "bid_received"
  );

  res.status(201).json({ success: true, data: bid });
});

export const getBid = asyncHandler(async (req: Request, res: Response) => {
  const bid = await prisma.bid.findUnique({
    where: { id: req.params.id },
    include: {
      vendor: { select: { id: true, name: true, vendorProfile: true } },
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
  const authUser = (req as Request & { user?: AuthUser }).user!;
  const existing = await prisma.bid.findUnique({
    where: { id: req.params.id },
    include: { request: { select: { buyerId: true } } },
  });
  if (!existing) {
    res.status(404).json({ success: false, error: { message: "Bid not found" } });
    return;
  }
  if (existing.request.buyerId !== authUser.id) {
    res.status(403).json({ success: false, error: { message: "Only the buyer can select this bid" } });
    return;
  }

  const selected = await prisma.bid.update({
    where: { id: req.params.id },
    data: { status: "selected" },
    include: {
      vendor: { select: { id: true, name: true, vendorProfile: true } },
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

  await notify(
    selected.vendorId,
    "Bid accepted",
    `Your bid for "${selected.request.foodName}" was selected. Get ready to cook!`,
    "bid_selected"
  );

  res.json({ success: true, data: selected });
});

export const rejectBid = asyncHandler(async (req: Request, res: Response) => {
  const authUser = (req as Request & { user?: AuthUser }).user!;
  const existing = await prisma.bid.findUnique({
    where: { id: req.params.id },
    include: { request: { select: { buyerId: true } } },
  });
  if (!existing) {
    res.status(404).json({ success: false, error: { message: "Bid not found" } });
    return;
  }
  if (existing.request.buyerId !== authUser.id) {
    res.status(403).json({ success: false, error: { message: "Only the buyer can reject this bid" } });
    return;
  }

  const bid = await prisma.bid.update({
    where: { id: req.params.id },
    data: { status: "rejected" },
    include: {
      vendor: { select: { id: true, name: true, vendorProfile: true } },
      request: { select: { id: true, foodName: true } },
    },
  });
  res.json({ success: true, data: bid });
});

export const updateBid = asyncHandler(async (req: Request, res: Response) => {
  const authUser = (req as Request & { user?: AuthUser }).user!;
  const { bidAmount, prepTimeMinutes, estimatedDeliveryTime, message } = req.body;

  const existing = await prisma.bid.findUnique({
    where: { id: req.params.id },
    include: { request: { select: { buyerId: true, status: true } } },
  });
  if (!existing) {
    res.status(404).json({ success: false, error: { message: "Bid not found" } });
    return;
  }
  if (existing.vendorId !== authUser.id) {
    res.status(403).json({ success: false, error: { message: "Only the vendor who placed this bid can update it" } });
    return;
  }
  if (existing.status === "selected" || existing.status === "rejected") {
    res.status(400).json({ success: false, error: { message: "Cannot update a selected or rejected bid" } });
    return;
  }
  if (existing.request.status !== "open") {
    res.status(400).json({ success: false, error: { message: "Request is no longer open for bids" } });
    return;
  }

  const bid = await prisma.bid.update({
    where: { id: req.params.id },
    data: {
      bidAmount: bidAmount !== undefined ? Number(bidAmount) : existing.bidAmount,
      prepTimeMinutes: prepTimeMinutes !== undefined ? Number(prepTimeMinutes) : existing.prepTimeMinutes,
      estimatedDeliveryTime: estimatedDeliveryTime ?? existing.estimatedDeliveryTime,
      message: message ?? existing.message,
    },
    include: {
      vendor: { select: { id: true, name: true, vendorProfile: true } },
      request: { select: { id: true, foodName: true } },
    },
  });

  await notify(
    existing.request.buyerId,
    "Bid updated",
    `${authUser.name} updated their bid to ₦${Number(bid.bidAmount).toLocaleString()} for "${bid.request.foodName}"`,
    "bid_updated"
  );

  res.json({ success: true, data: bid });
});

export const counterBid = asyncHandler(async (req: Request, res: Response) => {
  const authUser = (req as Request & { user?: AuthUser }).user!;
  const { bidAmount, message } = req.body;

  const existing = await prisma.bid.findUnique({
    where: { id: req.params.id },
    include: { request: { select: { buyerId: true, status: true } } },
  });
  if (!existing) {
    res.status(404).json({ success: false, error: { message: "Bid not found" } });
    return;
  }
  if (existing.request.buyerId !== authUser.id) {
    res.status(403).json({ success: false, error: { message: "Only the buyer can counter this bid" } });
    return;
  }
  if (existing.status === "selected" || existing.status === "rejected") {
    res.status(400).json({ success: false, error: { message: "Cannot counter a selected or rejected bid" } });
    return;
  }
  if (existing.request.status !== "open") {
    res.status(400).json({ success: false, error: { message: "Request is no longer open for bids" } });
    return;
  }

  const bid = await prisma.bid.update({
    where: { id: req.params.id },
    data: {
      bidAmount: Number(bidAmount),
      message: message ? `Counter: ${message}` : "Counter offer sent",
    },
    include: {
      vendor: { select: { id: true, name: true, vendorProfile: true } },
      request: { select: { id: true, foodName: true } },
    },
  });

  await notify(
    existing.vendorId,
    "Counter offer received",
    `${authUser.name} sent a counter offer of ₦${Number(bidAmount).toLocaleString()} for "${bid.request.foodName}"`,
    "bid_countered"
  );

  res.json({ success: true, data: bid });
});
