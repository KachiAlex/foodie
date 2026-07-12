import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";

export const listRequests = asyncHandler(async (req: Request, res: Response) => {
  const buyerId = req.query.buyerId as string | undefined;
  const data = await prisma.foodRequest.findMany({
    where: buyerId ? { buyerId } : undefined,
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
