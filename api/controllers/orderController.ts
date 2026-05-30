import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";

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
    buyerId,
    vendorId,
    bidId,
    foodCost,
    deliveryFee,
    platformFee,
    escrowFee,
    totalAmount,
  } = req.body;

  const userId = (req as Request & { user?: { id: string } }).user?.id;
  const resolvedBuyerId = buyerId || userId;
  const resolvedVendorId = vendorId || userId;

  const order = await prisma.order.create({
    data: {
      requestId,
      buyerId: resolvedBuyerId,
      vendorId: resolvedVendorId,
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

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json({ success: true, data: order });
});

export const confirmDelivery = asyncHandler(async (req: Request, res: Response) => {
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
