import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { generateId } from "../utils/generateId";

const inMemoryBids: any[] = [];

export const listBids = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: inMemoryBids });
});

export const createBid = asyncHandler(async (req: Request, res: Response) => {
  const bid = {
    id: generateId("BID"),
    ...req.body,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  inMemoryBids.push(bid);
  res.status(201).json({ success: true, data: bid });
});

export const getBid = asyncHandler(async (req: Request, res: Response) => {
  const bid = inMemoryBids.find((b) => b.id === req.params.id);
  if (!bid) {
    res.status(404).json({ success: false, error: { message: "Bid not found" } });
    return;
  }
  res.json({ success: true, data: bid });
});

export const selectBid = asyncHandler(async (req: Request, res: Response) => {
  const bid = inMemoryBids.find((b) => b.id === req.params.id);
  if (!bid) {
    res.status(404).json({ success: false, error: { message: "Bid not found" } });
    return;
  }
  bid.status = "selected";
  inMemoryBids
    .filter((b) => b.requestId === bid.requestId && b.id !== bid.id)
    .forEach((b) => (b.status = "rejected"));
  res.json({ success: true, data: bid });
});

export const rejectBid = asyncHandler(async (req: Request, res: Response) => {
  const bid = inMemoryBids.find((b) => b.id === req.params.id);
  if (!bid) {
    res.status(404).json({ success: false, error: { message: "Bid not found" } });
    return;
  }
  bid.status = "rejected";
  res.json({ success: true, data: bid });
});
