/**
 * Shrinks a photo in the browser before upload so it lands under `maxBytes`
 * (2MB by default). Big phone photos are resized to at most `maxEdge` px on the
 * long side and re-encoded (WebP where the browser supports it, else JPEG),
 * lowering quality — and then size — until the file fits.
 *
 * Files already under the limit, GIFs/SVGs, and formats the browser can't
 * decode (e.g. HEIC on most desktops) are returned unchanged.
 */
export async function compressImage(
  file: File,
  { maxBytes = 2 * 1024 * 1024, maxEdge = 2560 } = {},
): Promise<File> {
  if (typeof window === "undefined") return file;
  if (!file.type.startsWith("image/") || /gif|svg/.test(file.type)) return file;
  if (file.size <= maxBytes) return file;

  const bitmap = await decode(file);
  if (!bitmap) return file;

  try {
    const type = (await supportsWebp()) ? "image/webp" : "image/jpeg";
    let edge = Math.min(maxEdge, Math.max(bitmap.width, bitmap.height));
    let best: Blob | null = null;

    // Try a few quality levels at each size, then shrink the size and try again.
    for (let round = 0; round < 6; round++) {
      const scale = edge / Math.max(bitmap.width, bitmap.height);
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      if (type === "image/jpeg") {
        // JPEG has no transparency — give see-through PNGs a white background.
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, width, height);
      }
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap.source, 0, 0, width, height);

      for (const quality of [0.86, 0.78, 0.7, 0.62]) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
        if (!blob) continue;
        if (!best || blob.size < best.size) best = blob;
        if (blob.size <= maxBytes) return toFile(blob, file.name, type);
      }
      edge = Math.round(edge * 0.8);
    }

    return best && best.size < file.size ? toFile(best, file.name, type) : file;
  } finally {
    bitmap.close();
  }
}

type Decoded = { source: CanvasImageSource; width: number; height: number; close: () => void };

async function decode(file: File): Promise<Decoded | null> {
  if ("createImageBitmap" in window) {
    try {
      // Respect the camera's EXIF rotation so portraits don't come out sideways.
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
    } catch {
      // Fall through to <img> decoding.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => {} };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

let webpSupport: Promise<boolean> | null = null;

function supportsWebp() {
  webpSupport ??= new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    canvas.toBlob((blob) => resolve(blob?.type === "image/webp"), "image/webp");
  });
  return webpSupport;
}

function toFile(blob: Blob, name: string, type: string) {
  const ext = type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${name.replace(/\.[^.]+$/, "") || "photo"}.${ext}`, { type });
}
