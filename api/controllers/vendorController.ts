import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";

export const listVendors = asyncHandler(async (_req: Request, res: Response) => {
  const vendors = await prisma.vendorProfile.findMany({
    where: { verified: true },
    include: {
      user: { select: { id: true, name: true } },
      menuItems: { take: 3, select: { name: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  res.json({ success: true, data: vendors });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const vendorId = (req.params.id || (req as Request & { user?: { id: string } }).user?.id) as string;
  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: vendorId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      menuItems: true,
    },
  });
  if (!profile) {
    res.status(404).json({ success: false, error: { message: "Vendor not found" } });
    return;
  }
  res.json({ success: true, data: profile });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const vendorId = req.params.id;
  const { kitchenName, address, landmark, specialties, isOnline } = req.body;
  const profile = await prisma.vendorProfile.update({
    where: { userId: vendorId },
    data: {
      kitchenName,
      address,
      landmark,
      specialties,
      isOnline,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      menuItems: true,
    },
  });
  res.json({ success: true, data: profile });
});

export const getWallet = asyncHandler(async (req: Request, res: Response) => {
  const vendorId = (req.params.id || (req as Request & { user?: { id: string } }).user?.id) as string;
  const wallet = await prisma.escrowWallet.findUnique({
    where: { vendorId },
  });
  if (!wallet) {
    res.status(404).json({ success: false, error: { message: "Wallet not found" } });
    return;
  }
  res.json({ success: true, data: wallet });
});

export const getVendorOrders = asyncHandler(async (req: Request, res: Response) => {
  const vendorId = (req.params.id || (req as Request & { user?: { id: string } }).user?.id) as string;
  const data = await prisma.order.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { id: true, name: true } },
      request: true,
    },
  });
  res.json({ success: true, data });
});

export const getMenu = asyncHandler(async (req: Request, res: Response) => {
  const vendorId = (req.params.id || (req as Request & { user?: { id: string } }).user?.id) as string;
  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: vendorId },
    include: { menuItems: true },
  });
  if (!profile) {
    res.status(404).json({ success: false, error: { message: "Vendor not found" } });
    return;
  }
  res.json({ success: true, data: profile.menuItems });
});

export const addMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const vendorId = (req.params.id || (req as Request & { user?: { id: string } }).user?.id) as string;
  const { name, description, price, category, imageUrl } = req.body;

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: vendorId },
  });
  if (!profile) {
    res.status(404).json({ success: false, error: { message: "Vendor not found" } });
    return;
  }

  const item = await prisma.menuItem.create({
    data: {
      vendorId: profile.id,
      name,
      description,
      price: Number(price) || 0,
      category,
      imageUrl,
    },
  });
  res.status(201).json({ success: true, data: item });
});

export const searchVendors = asyncHandler(async (req: Request, res: Response) => {
  const q = ((req.query.q as string) || "").trim().toLowerCase();
  const vendors = await prisma.vendorProfile.findMany({
    where: {
      verified: true,
      OR: [
        { kitchenName: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { menuItems: { some: { name: { contains: q, mode: "insensitive" } } } },
      ],
    },
    include: {
      user: { select: { id: true, name: true } },
      menuItems: { take: 3, select: { name: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  res.json({ success: true, data: vendors });
});

export const toggleOnline = asyncHandler(async (req: Request, res: Response) => {
  const vendorId = (req as Request & { user?: { id: string } }).user?.id as string;
  const profile = await prisma.vendorProfile.findUnique({ where: { userId: vendorId } });
  if (!profile) {
    res.status(404).json({ success: false, error: { message: "Vendor not found" } });
    return;
  }
  const updated = await prisma.vendorProfile.update({
    where: { userId: vendorId },
    data: { isOnline: !profile.isOnline },
  });
  res.json({ success: true, data: updated });
});

export const getOpenRequests = asyncHandler(async (_req: Request, res: Response) => {
  const data = await prisma.foodRequest.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { id: true, name: true } },
      bids: true,
    },
  });
  res.json({ success: true, data });
});
