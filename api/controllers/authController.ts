import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";

function encodeToken(user: { id: string; email: string; name: string; role: string }) {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64");
  return `fm.${payload}.sig`;
}

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ success: false, error: { message: "Email already registered" } });
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: password,
      role: role || "buyer",
      verificationStatus: "pending",
    },
  });

  res.status(201).json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token: encodeToken({ id: user.id, email: user.email, name: user.name, role: user.role }),
    },
  });
});

export const signIn = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.passwordHash !== password) {
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
      token: encodeToken({ id: user.id, email: user.email, name: user.name, role: user.role }),
    },
  });
});

export const refreshToken = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: { token: "mock-jwt-token" } });
});

export const signOut = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, message: "Signed out" });
});
