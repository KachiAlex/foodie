import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  // TODO: hash password, create user in DB
  const user = {
    id: `usr-${Math.floor(1000 + Math.random() * 9000)}`,
    email,
    name,
    role: role || "buyer",
    token: "mock-jwt-token",
  };

  res.status(201).json({ success: true, data: user });
});

export const signIn = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // TODO: verify credentials against DB
  const user = {
    id: "usr-001",
    email,
    name: "Test User",
    role: email === "admin@foodiemarket.com" ? "admin" : "buyer",
    token: "mock-jwt-token",
  };

  res.json({ success: true, data: user });
});

export const refreshToken = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: { token: "mock-jwt-token" } });
});

export const signOut = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, message: "Signed out" });
});
