import { v2 as cloudinary } from "cloudinary";

const raw = process.env.CLOUDINARY_URL || "";
// Strip key prefix if env var was set as "CLOUDINARY_URL=cloudinary://..."
const url = raw.startsWith("CLOUDINARY_URL=") ? raw.slice("CLOUDINARY_URL=".length) : raw;

if (!url) {
  throw new Error("CLOUDINARY_URL is not set");
}

const parsed = new URL(url);
cloudinary.config({
  cloud_name: parsed.hostname,
  api_key: parsed.username,
  api_secret: parsed.password,
  secure: true,
});

export { cloudinary };
