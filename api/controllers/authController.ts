import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "foodie-market-dev-secret-change-in-production";
const JWT_EXPIRES_IN = "7d";

function signToken(user: { id: string; email: string; name: string; role: string }) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role, vendorVerification } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ success: false, error: { message: "Email already registered" } });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: role || "buyer",
      verificationStatus: role === "vendor" ? "pending" : "verified",
      vendorProfile:
        role === "vendor" && vendorVerification
          ? {
              create: {
                kitchenName: name,
                address: vendorVerification.address || "",
                landmark: vendorVerification.landmark || "",
                specialties: ["Nigerian"],
                rating: 0,
                totalOrders: 0,
                isOnline: false,
                verified: false,
              },
            }
          : undefined,
    },
  });

  res.status(201).json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      verificationStatus: user.verificationStatus,
      token: signToken({ id: user.id, email: user.email, name: user.name, role: user.role }),
    },
  });
});

export const signIn = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ success: false, error: { message: "Invalid credentials" } });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ success: false, error: { message: "Invalid credentials" } });
    return;
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      verificationStatus: user.verificationStatus,
      token: signToken({ id: user.id, email: user.email, name: user.name, role: user.role }),
    },
  });
});

export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(404).json({ success: false, error: { message: "No account found with that email" } });
    return;
  }

  const resetToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
  // In production, send email with reset link containing resetToken
  // For now, return token directly for testing
  res.json({
    success: true,
    data: {
      message: "Password reset link sent to your email",
      resetToken,
    },
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
  } catch {
    res.status(400).json({ success: false, error: { message: "Invalid or expired reset token" } });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: payload.id },
    data: { passwordHash },
  });

  res.json({ success: true, data: { message: "Password reset successfully" } });
});

export const refreshToken = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: { token: "mock-jwt-token" } });
});

export const signOut = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, message: "Signed out" });
});
