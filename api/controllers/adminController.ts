import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";

export const getDashboardMetrics = asyncHandler(async (_req: Request, res: Response) => {
  const [totalRequests, activeBids, escrowHeld, pendingDisputes, newVendors] = await Promise.all([
    prisma.foodRequest.count(),
    prisma.bid.count({ where: { status: "active" } }),
    prisma.escrowWallet.aggregate({ _sum: { pending: true } }),
    prisma.dispute.count({ where: { status: "open" } }),
    prisma.vendorProfile.count({ where: { verified: false } }),
  ]);

  res.json({
    success: true,
    data: {
      totalRequests,
      activeBids,
      escrowHeld: escrowHeld._sum.pending?.toNumber() || 0,
      pendingDisputes,
      newVendors,
    },
  });
});

export const listAllRequests = asyncHandler(async (_req: Request, res: Response) => {
  const data = await prisma.foodRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      bids: { include: { vendor: { select: { id: true, name: true } } } },
      order: true,
    },
  });
  res.json({ success: true, data });
});

export const listAllBids = asyncHandler(async (_req: Request, res: Response) => {
  const data = await prisma.bid.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { id: true, name: true } },
      request: { select: { id: true, foodName: true } },
    },
  });
  res.json({ success: true, data });
});

export const listAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { id: true, name: true } },
      request: { select: { id: true, foodName: true } },
      dispute: true,
    },
  });
  // vendorId is a bare FK — look up names in bulk
  const vendorIds = [...new Set(orders.map((o) => o.vendorId))];
  const vendors = vendorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: vendorIds } },
        select: { id: true, name: true },
      })
    : [];
  const vendorMap = Object.fromEntries(vendors.map((v) => [v.id, v.name]));
  const data = orders.map((o) => ({
    ...o,
    vendor: { id: o.vendorId, name: vendorMap[o.vendorId] ?? "Unknown" },
  }));
  res.json({ success: true, data });
});

export const listEscrowTransactions = asyncHandler(async (_req: Request, res: Response) => {
  const data = await prisma.escrowTransaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { id: true, name: true } },
    },
  });
  res.json({ success: true, data });
});

export const releaseEscrow = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.escrowTransaction.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ success: false, error: { message: "Transaction not found" } });
    return;
  }
  const tx = await prisma.escrowTransaction.update({
    where: { id: req.params.id },
    data: { status: "completed" },
  });
  res.json({ success: true, data: tx });
});

export const processRefund = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.escrowTransaction.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ success: false, error: { message: "Transaction not found" } });
    return;
  }
  const tx = await prisma.escrowTransaction.update({
    where: { id: req.params.id },
    data: { status: "completed", type: "refund" },
  });
  res.json({ success: true, data: tx });
});

export const listDisputes = asyncHandler(async (_req: Request, res: Response) => {
  const data = await prisma.dispute.findMany({
    orderBy: { openedAt: "desc" },
    include: {
      order: true,
      openedBy: { select: { id: true, name: true } },
    },
  });
  res.json({ success: true, data });
});

export const resolveDispute = asyncHandler(async (req: Request, res: Response) => {
  const { resolution } = req.body;
  const existing = await prisma.dispute.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ success: false, error: { message: "Dispute not found" } });
    return;
  }
  const dispute = await prisma.dispute.update({
    where: { id: req.params.id },
    data: {
      status: "resolved",
      resolution,
      resolvedAt: new Date(),
    },
    include: {
      order: true,
      openedBy: { select: { id: true, name: true } },
    },
  });
  res.json({ success: true, data: dispute });
});

export const listPendingVendors = asyncHandler(async (_req: Request, res: Response) => {
  const data = await prisma.vendorProfile.findMany({
    where: { verified: false },
    include: {
      user: { select: { id: true, name: true, email: true } },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });
  res.json({ success: true, data });
});

export const verifyVendor = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.vendorProfile.findUnique({ where: { userId: req.params.id } });
  if (!existing) {
    res.status(404).json({ success: false, error: { message: "Vendor profile not found" } });
    return;
  }
  const profile = await prisma.vendorProfile.update({
    where: { userId: req.params.id },
    data: { verified: true },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  await prisma.user.update({
    where: { id: req.params.id },
    data: { verificationStatus: "verified" },
  });
  await prisma.auditLog.create({
    data: {
      actor: "admin",
      action: "VENDOR_VERIFY",
      target: req.params.id,
      metadata: JSON.stringify({ verifiedAt: new Date().toISOString() }),
    },
  });
  res.json({ success: true, data: profile });
});

export const triggerVendorAudit = asyncHandler(async (req: Request, res: Response) => {
  await prisma.auditLog.create({
    data: {
      actor: "admin",
      action: "VENDOR_AUDIT",
      target: req.params.id,
      metadata: JSON.stringify({ triggeredAt: new Date().toISOString() }),
    },
  });
  res.json({ success: true, message: "Audit scheduled for vendor" });
});

export const flagVendor = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body;
  const existing = await prisma.vendorProfile.findUnique({ where: { userId: req.params.id } });
  if (!existing) {
    res.status(404).json({ success: false, error: { message: "Vendor not found" } });
    return;
  }
  const profile = await prisma.vendorProfile.update({
    where: { userId: req.params.id },
    data: { verified: false },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  await prisma.user.update({
    where: { id: req.params.id },
    data: { verificationStatus: "pending" },
  });
  await prisma.auditLog.create({
    data: {
      actor: "admin",
      action: "VENDOR_FLAG",
      target: req.params.id,
      metadata: JSON.stringify({ reason: reason || "No reason provided", flaggedAt: new Date().toISOString() }),
    },
  });
  res.json({ success: true, message: "Vendor flagged successfully", data: profile });
});

export const getVendorDocuments = asyncHandler(async (req: Request, res: Response) => {
  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: req.params.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });
  if (!profile) {
    res.status(404).json({ success: false, error: { message: "Vendor not found" } });
    return;
  }
  res.json({ success: true, data: profile });
});

export const approveDocument = asyncHandler(async (req: Request, res: Response) => {
  const doc = await prisma.vendorDocument.update({
    where: { id: req.params.id },
    data: { status: "approved" },
    include: {
      vendor: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
  await prisma.auditLog.create({
    data: {
      actor: "admin",
      action: "DOCUMENT_APPROVE",
      target: req.params.id,
      metadata: JSON.stringify({ vendorId: doc.vendorId, approvedAt: new Date().toISOString() }),
    },
  });
  res.json({ success: true, data: doc });
});

export const rejectDocument = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body;
  const doc = await prisma.vendorDocument.update({
    where: { id: req.params.id },
    data: { status: "rejected" },
    include: {
      vendor: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
  await prisma.auditLog.create({
    data: {
      actor: "admin",
      action: "DOCUMENT_REJECT",
      target: req.params.id,
      metadata: JSON.stringify({ vendorId: doc.vendorId, reason: reason || "No reason provided", rejectedAt: new Date().toISOString() }),
    },
  });
  res.json({ success: true, data: doc });
});

export const getAllVendors = asyncHandler(async (_req: Request, res: Response) => {
  // Vendors with a VendorProfile (registered fully)
  const profiles = await prisma.vendorProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });

  // Vendor-role users who never completed profile setup
  const profileUserIds = profiles.map((p) => p.userId);
  const profilelessVendors = await prisma.user.findMany({
    where: {
      role: "vendor",
      id: { notIn: profileUserIds.length ? profileUserIds : ["__none__"] },
    },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  // Shape profileless vendors to match the profile shape so the frontend handles them uniformly
  const syntheticProfiles = profilelessVendors.map((u) => ({
    id: null,
    userId: u.id,
    user: { id: u.id, name: u.name, email: u.email },
    kitchenName: "(No profile yet)",
    streetAddress: null,
    city: null,
    state: null,
    landmark: "",
    specialties: [],
    rating: 0,
    totalOrders: 0,
    isOnline: false,
    verified: false,
    createdAt: u.createdAt,
    updatedAt: u.createdAt,
    documents: [],
    noProfile: true,
  }));

  res.json({ success: true, data: [...profiles, ...syntheticProfiles] });
});

export const listAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const data = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      verificationStatus: true,
      createdAt: true,
      _count: {
        select: {
          ordersAsBuyer: true,
          bids: true,
        },
      },
      vendorProfile: {
        select: {
          id: true,
          kitchenName: true,
          verified: true,
          rating: true,
          totalOrders: true,
        },
      },
    },
  });
  res.json({ success: true, data });
});

export const suspendUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    res.status(404).json({ success: false, error: { message: "User not found" } });
    return;
  }
  await prisma.user.update({
    where: { id: req.params.id },
    data: { verificationStatus: "rejected" },
  });
  await prisma.auditLog.create({
    data: {
      actor: "admin",
      action: "USER_SUSPEND",
      target: req.params.id,
      metadata: JSON.stringify({ reason: req.body.reason || "Suspended by admin", suspendedAt: new Date().toISOString() }),
    },
  });
  res.json({ success: true, message: "User suspended" });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    res.status(404).json({ success: false, error: { message: "User not found" } });
    return;
  }
  await prisma.auditLog.create({
    data: {
      actor: "admin",
      action: "USER_DELETE",
      target: req.params.id,
      metadata: JSON.stringify({ email: user.email, deletedAt: new Date().toISOString() }),
    },
  });
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "User deleted" });
});
