import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { generateId } from "../utils/generateId";

const inMemoryOrders: any[] = [];

export const listOrders = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: inMemoryOrders });
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = {
    id: generateId("ORD"),
    ...req.body,
    status: "paid",
    createdAt: new Date().toISOString(),
  };
  inMemoryOrders.unshift(order);
  res.status(201).json({ success: true, data: order });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = inMemoryOrders.find((o) => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: { message: "Order not found" } });
    return;
  }
  res.json({ success: true, data: order });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = inMemoryOrders.find((o) => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: { message: "Order not found" } });
    return;
  }
  order.status = req.body.status;
  res.json({ success: true, data: order });
});

export const confirmDelivery = asyncHandler(async (req: Request, res: Response) => {
  const order = inMemoryOrders.find((o) => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: { message: "Order not found" } });
    return;
  }
  order.status = "completed";
  order.deliveredAt = new Date().toISOString();
  res.json({ success: true, data: order });
});

export const openDispute = asyncHandler(async (req: Request, res: Response) => {
  const order = inMemoryOrders.find((o) => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: { message: "Order not found" } });
    return;
  }
  order.status = "disputed";
  order.dispute = {
    reason: req.body.reason,
    openedAt: new Date().toISOString(),
  };
  res.json({ success: true, data: order });
});
