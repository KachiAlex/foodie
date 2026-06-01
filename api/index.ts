import express, { Request, Response } from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { setupCors } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

dotenv.config();

const app = express();
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(setupCors());

app.use("/api/auth/sign-in", authLimiter);
app.use("/api/auth/sign-up", authLimiter);
app.use("/api/auth/request-password-reset", passwordResetLimiter);
app.use("/api/auth/reset-password", passwordResetLimiter);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", routes);

app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Foodie Market API running on http://localhost:${PORT}`);
  });
}

export default app;
