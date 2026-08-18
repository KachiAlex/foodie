import "dotenv/config";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createServer } from "http";
import { setupCors } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import { initSocket } from "./lib/socket";
import routes from "./routes";
import fs from "fs";
import path from "path";
import { prisma } from "./lib/prisma";

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

// Dynamic Meta Tags for Social Sharing (Reach)
app.get("/community/vendors/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      include: { 
        user: { select: { name: true } },
        menuItems: { take: 1, select: { imageUrl: true } }
      }
    });

    const indexPath = path.join(process.cwd(), "hosting/dist/index.html");
    if (!fs.existsSync(indexPath)) {
      return res.sendFile(indexPath); // Fallback to normal if file doesn't exist
    }

    let html = fs.readFileSync(indexPath, "utf8");

    if (vendor) {
      const title = `${vendor.kitchenName} | Foodie Market`;
      const description = `Check out ${vendor.kitchenName}'s delicious home-cooked meals on Foodie Market.`;
      const image = vendor.menuItems[0]?.imageUrl || "https://foodie-marketplace.com/logo.png";
      const url = `https://foodie-marketplace.com/community/vendors/${id}`;

      html = html
        .replace(/<title>.*?<\/title>/g, `<title>${title}</title>`)
        .replace(/<meta property="og:title" content=".*?" \/>/g, `<meta property="og:title" content="${title}" />`)
        .replace(/<meta property="og:description" content=".*?" \/>/g, `<meta property="og:description" content="${description}" />`)
        .replace(/<meta property="og:image" content=".*?" \/>/g, `<meta property="og:image" content="${image}" />`)
        .replace(/<meta property="og:url" content=".*?" \/>/g, `<meta property="og:url" content="${url}" />`)
        .replace(/<meta property="twitter:title" content=".*?" \/>/g, `<meta property="twitter:title" content="${title}" />`)
        .replace(/<meta property="twitter:description" content=".*?" \/>/g, `<meta property="twitter:description" content="${description}" />`)
        .replace(/<meta property="twitter:image" content=".*?" \/>/g, `<meta property="twitter:image" content="${image}" />`);
    }

    res.send(html);
  } catch (error) {
    console.error("[Dynamic Tags Error]", error);
    const indexPath = path.join(process.cwd(), "hosting/dist/index.html");
    res.sendFile(indexPath);
  }
});

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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
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
  httpServer.listen(PORT, () => {
    console.log(`Foodie Market API running on http://localhost:${PORT}`);
  });
}

export default app;
