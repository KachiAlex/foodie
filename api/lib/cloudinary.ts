import { v2 as cloudinary } from "cloudinary";

const raw = process.env.CLOUDINARY_URL || "";
// Strip key prefix if env var was set as "CLOUDINARY_URL=cloudinary://..."
const url = raw.startsWith("CLOUDINARY_URL=") ? raw.slice("CLOUDINARY_URL=".length) : raw;

if (!url) {
  throw new Error("CLOUDINARY_URL is not set");
}

// Parse cloudinary://API_KEY:API_SECRET@CLOUD_NAME
const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
if (!match) {
  throw new Error("CLOUDINARY_URL format is invalid. Expected: cloudinary://api_key:api_secret@cloud_name");
}

const [, apiKey, apiSecret, cloudName] = match;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export { cloudinary };
