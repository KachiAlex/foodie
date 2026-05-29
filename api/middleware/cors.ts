import cors, { CorsOptions } from "cors";

export function setupCors() {
  const options: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowed = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://foodie-zeta-amber.vercel.app",
        "https://foodiemarket.vercel.app",
      ];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
  return cors(options);
}
