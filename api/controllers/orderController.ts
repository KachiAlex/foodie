import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";

async function notify(userId: string, title: string, body: string, type: string) {
  try {
    await prisma.notification.create({
      data: { userId, title, body, type },
    });
  } catch {
    // silent fail
  }
}

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const { buyerId, vendorId } = req.query as Record<string, string | undefined>;
  const data = await prisma.order.findMany({
    where: {
      ...(buyerId ? { buyerId } : {}),
      ...(vendorId ? { vendorId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      request: true,
      dispute: true,
    },
  });
  res.json({ success: true, data });
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const {
    requestId,
    vendorId,
    bidId,
    foodCost,
    deliveryFee,
    platformFee,
    escrowFee,
    totalAmount,
  } = req.body;

  const buyerId = (req as Request & { user?: { id: string } }).user?.id;
  if (!buyerId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }
  if (!vendorId) {
    res.status(400).json({ success: false, error: { message: "vendorId is required" } });
    return;
  }

  const order = await prisma.order.create({
    data: {
      requestId,
      buyerId,
      vendorId,
      bidId,
      foodCost: Number(foodCost) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      platformFee: Number(platformFee) || 0,
      escrowFee: Number(escrowFee) || 0,
      totalAmount: Number(totalAmount) || 0,
      status: "paid",
    },
    include: {
      buyer: { select: { id: true, name: true } },
      request: true,
    },
  });

  // Update request status to paid
  await prisma.foodRequest.update({
    where: { id: requestId },
    data: { status: "paid" },
  });

  res.status(201).json({ success: true, data: order });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      buyer: { select: { id: true, name: true } },
      request: true,
      dispute: true,
    },
  });
  if (!order) {
    res.status(404).json({ success: false, error: { message: "Order not found" } });
    return;
  }
  res.json({ success: true, data: order });
});

const VALID_ORDER_STATUSES = [
  "paid",
  "accepted",
  "cooking",
  "ready_for_pickup",
  "picked_up",
  "delivered",
  "completed",
  "disputed",
  "cancelled",
] as const;

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!VALID_ORDER_STATUSES.includes(status)) {
    res.status(400).json({ success: false, error: { message: "Invalid order status" } });
    return;
  }
  const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ success: false, error: { message: "Order not found" } });
    return;
  }
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
  });

  await notify(
    existing.buyerId,
    "Order update",
    `Your order status changed to "${status}"`,
    "order_update"
  );

  res.json({ success: true, data: order });
});

export const confirmDelivery = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ success: false, error: { message: "Order not found" } });
    return;
  }
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: "completed", deliveredAt: new Date() },
    include: {
      buyer: { select: { id: true, name: true } },
      request: true,
    },
  });
  res.json({ success: true, data: order });
});

export const openDispute = asyncHandler(async (req: Request, res: Response) => {
  const { reason, openedById } = req.body;

  const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ success: false, error: { message: "Order not found" } });
    return;
  }

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: "disputed" },
  });

  const dispute = await prisma.dispute.create({
    data: {
      orderId: req.params.id,
      openedById,
      reason,
      status: "open",
    },
    include: {
      order: true,
      openedBy: { select: { id: true, name: true } },
    },
  });

  res.json({ success: true, data: { order, dispute } });
});
