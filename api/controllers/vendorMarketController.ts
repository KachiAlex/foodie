import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";

type AuthRequest = Request & { user?: { id: string; role: string } };

export const listVendorMarket = asyncHandler(async (_req: Request, res: Response) => {
  const vendors = await prisma.vendorProfile.findMany({
    where: { verified: true },
    include: {
      user: { select: { id: true, name: true, email: true } },
      menuItems: {
        where: { isAvailable: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: vendors });
});

export const createOffer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const buyerId = req.user?.id;
  if (!buyerId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  const { menuItemId, vendorId, quantity, servings, deliveryDate, note, proposedPrice } = req.body;

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
    include: { vendor: { include: { user: { select: { id: true } } } } },
  });
  if (!menuItem) {
    res.status(404).json({ success: false, error: { message: "Menu item not found" } });
    return;
  }

  if (menuItem.vendor.user.id !== vendorId) {
    res.status(400).json({ success: false, error: { message: "Vendor does not own this menu item" } });
    return;
  }

  const offer = await prisma.vendorMarketOffer.create({
    data: {
      menuItemId,
      vendorId,
      buyerId,
      quantity,
      servings,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      note,
      proposedPrice,
    },
    include: {
      menuItem: true,
      buyer: { select: { id: true, name: true, email: true } },
      vendor: { select: { id: true, name: true, email: true } },
    },
  });

  res.status(201).json({ success: true, data: offer });
});

export const listOffers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  const where = role === "vendor" ? { vendorId: userId } : { buyerId: userId };
  const offers = await prisma.vendorMarketOffer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      menuItem: true,
      buyer: { select: { id: true, name: true, email: true } },
      vendor: { select: { id: true, name: true, email: true } },
    },
  });

  res.json({ success: true, data: offers });
});

export const updateOffer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  const { status, proposedPrice, note } = req.body;
  const offer = await prisma.vendorMarketOffer.findUnique({
    where: { id: req.params.id },
  });
  if (!offer) {
    res.status(404).json({ success: false, error: { message: "Offer not found" } });
    return;
  }

  if (role === "vendor" && offer.vendorId !== userId) {
    res.status(403).json({ success: false, error: { message: "Forbidden" } });
    return;
  }
  if (role === "buyer" && offer.buyerId !== userId) {
    res.status(403).json({ success: false, error: { message: "Forbidden" } });
    return;
  }

  if (role === "buyer" && status !== "cancelled" && !(status === "accepted" && offer.status === "countered")) {
    res.status(400).json({ success: false, error: { message: "Buyers can only accept a countered offer or cancel it" } });
    return;
  }

  if (role === "vendor" && status === "cancelled") {
    res.status(400).json({ success: false, error: { message: "Vendors cannot cancel offers" } });
    return;
  }

  const updated = await prisma.vendorMarketOffer.update({
    where: { id: req.params.id },
    data: {
      status,
      proposedPrice: proposedPrice !== undefined ? proposedPrice : offer.proposedPrice,
      note: note !== undefined ? note : offer.note,
    },
    include: {
      menuItem: true,
      buyer: { select: { id: true, name: true, email: true } },
      vendor: { select: { id: true, name: true, email: true } },
    },
  });

  res.json({ success: true, data: updated });
});
