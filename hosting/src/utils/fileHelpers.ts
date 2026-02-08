type CompressImageOptions = {
  maxDimension?: number;
  quality?: number;
};

function buildCompressedName(originalName: string) {
  const lastDot = originalName.lastIndexOf(".");
  if (lastDot === -1) {
    return `${originalName}-compressed`;
  }
  const base = originalName.slice(0, lastDot);
  const extension = originalName.slice(lastDot);
  return `${base}-compressed${extension}`;
}

export async function compressImageFile(file: File, options: CompressImageOptions = {}) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const { maxDimension = 1600, quality = 0.72 } = options;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
  const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    return file;
  }
  context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

  const preferredType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, preferredType, quality));
  if (!blob || blob.size >= file.size) {
    return file;
  }

  return new File([blob], buildCompressedName(file.name), { type: blob.type, lastModified: Date.now() });
}

export async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function dataUrlToFile(dataUrl: string, fileName: string, mimeType: string) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: mimeType, lastModified: Date.now() });
}
