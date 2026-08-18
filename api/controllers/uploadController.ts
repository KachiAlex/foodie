import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadToR2 } from "../lib/r2";
import crypto from "crypto";

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const { fileBase64, folder } = req.body;
  const userId = (req as any).user?.id;

  if (!fileBase64) {
    res.status(400).json({ success: false, error: { message: "File is required" } });
    return;
  }

  const folderPath = folder || `foodie/uploads/${userId || "guest"}`;
  const ext = "jpg";
  const key = `${folderPath}/${crypto.randomUUID()}.${ext}`;

  const result = await uploadToR2(fileBase64, key, "image/jpeg");

  res.status(201).json({
    success: true,
    data: {
      url: result.url,
      publicId: result.key,
    },
  });
});
