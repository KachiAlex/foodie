import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { generateId } from "../utils/generateId";

const inMemoryRequests: any[] = [];

export const listRequests = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: inMemoryRequests });
});

export const createRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = {
    id: generateId("REQ"),
    ...req.body,
    status: "open",
    bids: 0,
    createdAt: new Date().toISOString(),
  };
  inMemoryRequests.unshift(request);
  res.status(201).json({ success: true, data: request });
});

export const getRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = inMemoryRequests.find((r) => r.id === req.params.id);
  if (!request) {
    res.status(404).json({ success: false, error: { message: "Request not found" } });
    return;
  }
  res.json({ success: true, data: request });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const request = inMemoryRequests.find((r) => r.id === req.params.id);
  if (!request) {
    res.status(404).json({ success: false, error: { message: "Request not found" } });
    return;
  }
  request.status = req.body.status;
  res.json({ success: true, data: request });
});

export const getRequestBids = asyncHandler(async (req: Request, res: Response) => {
  const request = inMemoryRequests.find((r) => r.id === req.params.id);
  if (!request) {
    res.status(404).json({ success: false, error: { message: "Request not found" } });
    return;
  }
  res.json({ success: true, data: request.bids || [] });
});
