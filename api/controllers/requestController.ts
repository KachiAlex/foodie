import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";
import type { AuthUser } from "../middleware/auth";

async function notify(userId: string, title: string, body: string, type: string) {
  try {
    await prisma.notification.create({
      data: { userId, title, body, type },
    });
  } catch (err) {
    // Notification failures should not break business logic, but they must be visible.
    console.error("[notification] failed to create notification for user", userId, { title, type, error: err });
  }
}

export const listRequests = asyncHandler(async (req: Request, res: Response) => {
  const buyerId = req.query.buyerId as string | undefined;
  const updatedAfter = req.query.updatedAfter as string | undefined;
  const data = await prisma.foodRequest.findMany({
    where: {
      ...(buyerId ? { buyerId } : {}),
      ...(updatedAfter
        ? {
            OR: [
              { updatedAt: { gt: new Date(updatedAfter) } },
              { bids: { some: { updatedAt: { gt: new Date(updatedAfter) } } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      bids: {
        orderBy: { createdAt: "desc" },
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
              vendorProfile: true,
            },
          },
        },
      },
      order: true,
    },
  });
  res.json({ success: true, data });
});

export const createRequest = asyncHandler(async (req: Request, res: Response) => {
  const {
    buyerId,
    foodName,
    category,
    quantity,
    unit,
    budgetMin,
    budgetMax,
    deliveryAddress,
    deliveryDateTime,
    instructions,
    imageUrl,
  } = req.body;

  const resolvedBuyerId = buyerId || (req as Request & { user?: { id: string } }).user?.id;

  const request = await prisma.foodRequest.create({
    data: {
      buyerId: resolvedBuyerId,
      foodName,
      category,
      quantity: Number(quantity) || 1,
      unit,
      budgetMin: Number(budgetMin) || 0,
      budgetMax: Number(budgetMax) || 0,
      deliveryAddress,
      deliveryDateTime: new Date(deliveryDateTime),
      instructions,
      imageUrl,
      status: "open",
    },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
    },
  });

  res.status(201).json({ success: true, data: request });
});

export const getRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = await prisma.foodRequest.findUnique({
    where: { id: req.params.id },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      bids: {
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
              vendorProfile: true,
            },
          },
        },
        orderBy: { bidAmount: "asc" },
      },
      order: true,
    },
  });
  if (!request) {
    res.status(404).json({ success: false, error: { message: "Request not found" } });
    return;
  }
  res.json({ success: true, data: request });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const existing = await prisma.foodRequest.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ success: false, error: { message: "Request not found" } });
    return;
  }
  const request = await prisma.foodRequest.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json({ success: true, data: request });
});

export const reopenRequest = asyncHandler(async (req: Request, res: Response) => {
  const authUser = (req as Request & { user?: AuthUser }).user!;
  const existing = await prisma.foodRequest.findUnique({
    where: { id: req.params.id },
    include: { bids: true },
  });
  if (!existing) {
    res.status(404).json({ success: false, error: { message: "Request not found" } });
    return;
  }
  if (existing.buyerId !== authUser.id) {
    res.status(403).json({ success: false, error: { message: "Only the buyer can reopen this request" } });
    return;
  }
  if (existing.status !== "bid_selected") {
    res.status(400).json({ success: false, error: { message: "Request can only be reopened before payment" } });
    return;
  }

  // Cancel the accepted (unpaid) order for this request
  await prisma.order.updateMany({
    where: { requestId: existing.id, status: "accepted" },
    data: { status: "cancelled" },
  });

  // Reset all bids back to active
  await prisma.bid.updateMany({
    where: { requestId: existing.id },
    data: { status: "active" },
  });

  // Reopen the request
  await prisma.foodRequest.update({
    where: { id: existing.id },
    data: { status: "open", selectedBidId: null },
  });

  const selectedBid = existing.bids.find((b) => b.status === "selected");
  if (selectedBid) {
    await notify(
      selectedBid.vendorId,
      "Selection cancelled",
      `Your selection for "${existing.foodName}" was cancelled. The request is open for bidding again.`,
      "bid_reopened"
    );
  }

  const request = await prisma.foodRequest.findUnique({
    where: { id: existing.id },
    include: { buyer: { select: { id: true, name: true, email: true } } },
  });
  res.json({ success: true, data: request });
});

export const getRequestBids = asyncHandler(async (req: Request, res: Response) => {
  const request = await prisma.foodRequest.findUnique({
    where: { id: req.params.id },
    include: {
      bids: {
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
              vendorProfile: true,
            },
          },
        },
        orderBy: { bidAmount: "asc" },
      },
    },
  });
  if (!request) {
    res.status(404).json({ success: false, error: { message: "Request not found" } });
    return;
  }
  res.json({ success: true, data: request.bids });
});
