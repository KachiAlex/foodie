import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthUser {
  id: string;
  email: string;
  role: "buyer" | "vendor" | "admin";
  name: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "foodie-market-dev-secret-change-in-production";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    const error = new Error("Unauthorized: missing token");
    (error as Error & { statusCode?: number }).statusCode = 401;
    return next(error);
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    (req as Request & { user?: AuthUser }).user = payload;
    next();
  } catch {
    const error = new Error("Unauthorized: invalid token");
    (error as Error & { statusCode?: number }).statusCode = 401;
    next(error);
  }
}

export function requireRole(...roles: AuthUser["role"][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: AuthUser }).user;
    if (!user || !roles.includes(user.role)) {
      const error = new Error("Forbidden: insufficient permissions");
      (error as Error & { statusCode?: number }).statusCode = 403;
      return next(error);
    }
    next();
  };
}
