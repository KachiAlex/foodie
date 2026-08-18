import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";
import { queueNotification } from "../services/notificationService";
import { updateBuyerPreferences } from "../services/tasteMatchService";

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, rating, comment, images } = req.body;
  const buyerId = (req as any).user?.id;

  if (!buyerId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  // Verify order exists and belongs to the buyer
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { review: true }
  });

  if (!order) {
    res.status(404).json({ success: false, error: { message: "Order not found" } });
    return;
  }

  if (order.buyerId !== buyerId) {
    res.status(403).json({ success: false, error: { message: "You can only review your own orders" } });
    return;
  }

  if (order.status !== "completed" && order.status !== "delivered") {
    res.status(400).json({ success: false, error: { message: "You can only review completed orders" } });
    return;
  }

  if (order.review) {
    res.status(400).json({ success: false, error: { message: "Order already reviewed" } });
    return;
  }

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: order.vendorId }
  });

  if (!vendor) {
    res.status(404).json({ success: false, error: { message: "Vendor profile not found" } });
    return;
  }

  const review = await prisma.review.create({
    data: {
      orderId,
      buyerId,
      vendorProfileId: vendor.id,
      rating,
      comment,
      images: images || [],
    }
  });

  // Update vendor aggregate rating
  const allReviews = await prisma.review.findMany({
    where: { vendorProfileId: vendor.id },
    select: { rating: true }
  });

  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await prisma.vendorProfile.update({
    where: { id: vendor.id },
    data: { rating: avgRating }
  });

  // Notify vendor
  await queueNotification({
    recipientId: order.vendorId,
    type: "general",
    title: "New Review Received",
    body: `A buyer left a ${rating}-star review for order #${order.id.slice(-6)}`,
    metadata: { orderId, reviewId: review.id }
  });

  // Update buyer's taste preferences with review signal
  updateBuyerPreferences(buyerId).catch((err) =>
    console.error("[taste-match] Failed to update preferences after review:", err)
  );

  res.status(201).json({ success: true, data: review });
});

export const getVendorReviews = asyncHandler(async (req: Request, res: Response) => {
  const { vendorId } = req.params;

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: vendorId }
  });

  if (!vendor) {
    res.status(404).json({ success: false, error: { message: "Vendor profile not found" } });
    return;
  }

  const reviews = await prisma.review.findMany({
    where: { vendorProfileId: vendor.id },
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({ success: true, data: reviews });
});
