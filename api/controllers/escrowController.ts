import crypto from "crypto";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";
import type { AuthUser } from "../middleware/auth";
import * as paystack from "../services/paystackService";

// ─── GET WALLET ────────────────────────────────────────────────────────────────

export const getWallet = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user?: AuthUser }).user!.id;
  const wallet = await prisma.escrowWallet.findUnique({ where: { vendorId: userId } });
  if (!wallet) {
    res.status(404).json({ success: false, error: { message: "Wallet not found" } });
    return;
  }
  res.json({ success: true, data: wallet });
});

// ─── GET TRANSACTIONS ──────────────────────────────────────────────────────────

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user?: AuthUser }).user!.id;
  const data = await prisma.escrowTransaction.findMany({
    where: { vendorId: userId },
    orderBy: { createdAt: "desc" },
    include: { vendor: { select: { id: true, name: true } } },
  });
  res.json({ success: true, data });
});

// ─── INITIATE PAYMENT (buyer pays for an order) ────────────────────────────────
// POST /api/escrow/initiate-payment
// Body: { orderId }
// Returns: { authorization_url, reference }

export const initiatePayment = asyncHandler(async (req: Request, res: Response) => {
  const buyer = (req as Request & { user?: AuthUser }).user!;
  const { orderId } = req.body as { orderId: string };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { buyer: { select: { id: true, email: true, name: true } }, request: true },
  });

  if (!order) {
    res.status(404).json({ success: false, error: { message: "Order not found" } });
    return;
  }
  if (order.buyerId !== buyer.id) {
    res.status(403).json({ success: false, error: { message: "Not your order" } });
    return;
  }
  if (order.status !== "accepted") {
    res.status(400).json({ success: false, error: { message: `Order already in status: ${order.status}` } });
    return;
  }

  const reference = `fdm_${orderId}_${Date.now()}`;
  const amount = Number(order.totalAmount);

  const result = await paystack.initializeTransaction({
    email: order.buyer.email,
    amount,
    reference,
    metadata: { orderId, buyerId: buyer.id, vendorId: order.vendorId },
    callback_url: `${process.env.FRONTEND_URL ?? "https://foodie.vercel.app"}/dashboard/buyer?payment=success&ref=${reference}`,
  });

  // Create a pending escrow transaction
  await prisma.escrowTransaction.create({
    data: {
      orderId,
      vendorId: order.vendorId,
      amount,
      type: "deposit",
      status: "pending",
      paystackReference: reference,
      paystackAccessCode: result.access_code,
      metadata: JSON.stringify({ buyerId: buyer.id }),
    },
  });

  res.json({ success: true, data: { authorization_url: result.authorization_url, reference } });
});

// ─── VERIFY PAYMENT (called after redirect OR as Paystack webhook) ─────────────
// POST /api/escrow/verify-payment
// Body: { reference } or Paystack webhook payload

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  // Paystack webhook signature verification
  const paystackSig = req.headers["x-paystack-signature"] as string | undefined;
  const secret = process.env.PAYSTACK_SECRET_KEY ?? "";

  if (paystackSig) {
    const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(req.body)).digest("hex");
    if (hash !== paystackSig) {
      res.status(401).json({ success: false, error: { message: "Invalid signature" } });
      return;
    }
  }

  const reference: string =
    req.body?.data?.reference ?? req.body?.reference;

  if (!reference) {
    res.status(400).json({ success: false, error: { message: "reference required" } });
    return;
  }

  const verification = await paystack.verifyTransaction(reference);

  if (verification.status !== "success") {
    res.json({ success: false, data: { status: verification.status } });
    return;
  }

  // Find the pending escrow transaction
  const escrowTx = await prisma.escrowTransaction.findFirst({
    where: { paystackReference: reference, status: "pending" },
  });

  if (!escrowTx) {
    // Idempotent — already processed
    res.json({ success: true, data: { status: "already_processed" } });
    return;
  }

  const orderId = escrowTx.orderId!;
  const vendorId = escrowTx.vendorId;
  const amount = Number(escrowTx.amount);

  // Mark transaction completed
  await prisma.escrowTransaction.update({
    where: { id: escrowTx.id },
    data: { status: "completed" },
  });

  // Hold funds in vendor wallet as pending (not yet available until delivery)
  await prisma.escrowWallet.upsert({
    where: { vendorId },
    update: { pending: { increment: amount } },
    create: { vendorId, available: 0, pending: amount, totalEarned: 0, currency: "NGN" },
  });

  // Advance order to paid
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "paid" },
  });

  // Advance linked request to paid
  if (order.requestId) {
    await prisma.foodRequest.update({
      where: { id: order.requestId },
      data: { status: "paid" },
    });
  }

  res.json({ success: true, data: { status: "success", orderId } });
});

// ─── RELEASE ESCROW (called on delivery confirmation) ─────────────────────────
// POST /api/escrow/release/:orderId

export const releaseEscrow = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    res.status(404).json({ success: false, error: { message: "Order not found" } });
    return;
  }
  if (order.status !== "delivered" && order.status !== "completed") {
    res.status(400).json({ success: false, error: { message: "Order must be delivered before escrow release" } });
    return;
  }

  const vendorId = order.vendorId;
  const amount = Number(order.totalAmount);
  const platformFee = Number(order.platformFee);
  const releaseAmount = amount - platformFee;

  // Move from pending → available in wallet
  const wallet = await prisma.escrowWallet.findUnique({ where: { vendorId } });
  if (!wallet) {
    res.status(404).json({ success: false, error: { message: "Vendor wallet not found" } });
    return;
  }
  await prisma.escrowWallet.update({
    where: { vendorId },
    data: {
      pending: { decrement: amount },
      available: { increment: releaseAmount },
      totalEarned: { increment: releaseAmount },
    },
  });

  // Record release transaction
  const tx = await prisma.escrowTransaction.create({
    data: {
      orderId,
      vendorId,
      amount: releaseAmount,
      type: "release",
      status: "completed",
      metadata: JSON.stringify({ platformFee }),
    },
  });

  // Mark order completed
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "completed", deliveredAt: new Date() },
  });

  res.json({ success: true, data: tx });
});

// ─── WITHDRAW (vendor withdraws available balance) ────────────────────────────
// POST /api/escrow/withdraw
// Body: { amount, account_number, bank_code }

export const withdraw = asyncHandler(async (req: Request, res: Response) => {
  const vendor = (req as Request & { user?: AuthUser }).user!;
  const { amount, account_number, bank_code } = req.body as {
    amount: number;
    account_number: string;
    bank_code: string;
  };

  const wallet = await prisma.escrowWallet.findUnique({ where: { vendorId: vendor.id } });
  if (!wallet || Number(wallet.available) < amount) {
    res.status(400).json({ success: false, error: { message: "Insufficient available balance" } });
    return;
  }

  const recipient = await paystack.createTransferRecipient({
    name: vendor.name,
    account_number,
    bank_code,
  });

  const reference = `fdm_withdraw_${vendor.id}_${Date.now()}`;
  const transfer = await paystack.initiateTransfer({
    amount,
    recipient: recipient.recipient_code,
    reason: "Foodie Market vendor payout",
    reference,
  });

  await prisma.escrowWallet.update({
    where: { vendorId: vendor.id },
    data: { available: { decrement: amount } },
  });

  const tx = await prisma.escrowTransaction.create({
    data: {
      vendorId: vendor.id,
      amount,
      type: "withdrawal",
      status: transfer.status === "success" ? "completed" : "pending",
      paystackReference: reference,
      metadata: JSON.stringify({ transfer_code: transfer.transfer_code }),
    },
  });

  res.json({ success: true, data: tx });
});

// ─── LEGACY deposit kept for admin use ────────────────────────────────────────
export const deposit = asyncHandler(async (req: Request, res: Response) => {
  const { vendorId, amount, orderId } = req.body;
  const tx = await prisma.escrowTransaction.create({
    data: { vendorId, orderId, amount: Number(amount) || 0, type: "deposit", status: "completed" },
  });
  await prisma.escrowWallet.upsert({
    where: { vendorId },
    update: { pending: { increment: Number(amount) || 0 } },
    create: { vendorId, available: 0, pending: Number(amount) || 0, totalEarned: 0, currency: "NGN" },
  });
  res.json({ success: true, data: tx });
});
