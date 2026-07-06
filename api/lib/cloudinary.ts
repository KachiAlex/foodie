import { v2 as cloudinary } from "cloudinary";

const raw = process.env.CLOUDINARY_URL || "";
const url = raw.startsWith("CLOUDINARY_URL=") ? raw.slice("CLOUDINARY_URL=".length) : raw;

if (url) {
  const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (match) {
    const [, apiKey, apiSecret, cloudName] = match;
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  } else {
    console.warn("[cloudinary] CLOUDINARY_URL format is invalid — uploads will fail.");
  }
} else {
  console.warn("[cloudinary] CLOUDINARY_URL is not set — document uploads will fail.");
}

export { cloudinary };
