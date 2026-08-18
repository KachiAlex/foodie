import "dotenv/config";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { setupCors } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many requests. Please try again later." } },
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many password reset attempts. Please try again in an hour." } },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/api/health",
  message: { success: false, error: { message: "Too many requests. Please try again later." } },
});

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(setupCors());

// Request logging (skip health checks to reduce noise)
app.use((req: Request, _res: Response, next: () => void) => {
  if (req.path !== "/api/health") {
    console.log(`[req] ${req.method} ${req.originalUrl} - ${req.ip}`);
  }
  next();
});

app.use("/api/auth/sign-in", authLimiter);
app.use("/api/auth/sign-up", authLimiter);
app.use("/api/auth/request-password-reset", passwordResetLimiter);
app.use("/api/auth/reset-password", passwordResetLimiter);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", apiLimiter, routes);

app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Foodie Market API running on http://localhost:${PORT}`);
  });
}

export default app;
