import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID || "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const bucketName = process.env.R2_BUCKET_NAME || "foodie-market";
const publicUrl = process.env.R2_PUBLIC_URL || "";

let s3Client: S3Client | null = null;

function getClient(): S3Client {
  if (!s3Client) {
    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.warn("[R2] R2 credentials are not set — uploads will fail.");
    }
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3Client;
}

export interface R2UploadResult {
  url: string;
  key: string;
}

export async function uploadToR2(
  fileBase64: string,
  key: string,
  contentType: string = "image/jpeg"
): Promise<R2UploadResult> {
  const client = getClient();

  const base64Data = fileBase64.includes(",")
    ? fileBase64.split(",")[1]
    : fileBase64;
  const body = Buffer.from(base64Data, "base64");

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  const baseUrl = publicUrl || `https://${accountId}.r2.cloudflarestorage.com`;
  const url = `${baseUrl}/${key}`;

  return { url, key };
}

export { bucketName };
