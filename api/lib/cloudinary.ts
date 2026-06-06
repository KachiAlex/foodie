import { v2 as cloudinary } from "cloudinary";

const url = process.env.CLOUDINARY_URL;
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
