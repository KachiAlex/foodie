import { Request, Response, NextFunction } from "express";

export interface AuthUser {
  id: string;
  email: string;
  role: "buyer" | "vendor" | "admin";
  name: string;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    const error = new Error("Unauthorized: missing token");
    (error as Error & { statusCode?: number }).statusCode = 401;
    return next(error);
  }

  const token = authHeader.slice(7);

  // TODO: verify JWT with real secret
  // For now, allow a test token pattern
  if (token === "test-token") {
    (req as Request & { user?: AuthUser }).user = {
      id: "usr-001",
      email: "test@foodiemarket.com",
      role: "buyer",
      name: "Test User",
    };
    return next();
  }

  // Decode fm.<base64>.sig token
  try {
    const parts = token.split(".");
    const encoded = parts.length === 3 ? parts[1] : token;
    const payload = JSON.parse(Buffer.from(encoded, "base64").toString()) as AuthUser;
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
