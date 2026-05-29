import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { setupCors } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(setupCors());

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
