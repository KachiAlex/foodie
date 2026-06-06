import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }
  const data = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({ success: true, data });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }
  const notification = await prisma.notification.updateMany({
    where: { id: req.params.id, userId },
    data: { read: true },
  });
  res.json({ success: true, data: { count: notification.count } });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  res.json({ success: true, data: { count: result.count } });
});
