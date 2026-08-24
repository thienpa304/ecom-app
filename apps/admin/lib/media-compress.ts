import sharp from "sharp";

/**
 * Shrink oversized raster uploads before they reach storage.
 *
 * Uploads used to be stored at whatever resolution the camera produced —
 * typically 2.5-5MB, 2500px+ on the long edge — while the storefront never
 * renders above 1200px. Keep these values in step with
 * scripts/migrate-media-to-r2.mjs so migrated and freshly uploaded media look
 * the same.
 */
const MAX_EDGE = 1600;
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 82;
/** Below this, recompression costs quality without meaningfully saving bytes. */
const SKIP_UNDER_BYTES = 60 * 1024;

const RASTER_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

export type CompressResult = {
  buffer: Buffer;
  /** True when the bytes differ from the input. */
  changed: boolean;
};

export async function compressUploadBuffer(
  buffer: Buffer,
  ext: string,
): Promise<CompressResult> {
  if (!RASTER_EXT.has(ext) || buffer.byteLength < SKIP_UNDER_BYTES) {
    return { buffer, changed: false };
  }

  try {
    const image = sharp(buffer, { failOn: "none" });
    const meta = await image.metadata();
    const longest = Math.max(meta.width ?? 0, meta.height ?? 0);

    // `rotate()` with no argument bakes in EXIF orientation, which is lost
    // once the image is re-encoded.
    let pipeline = image.rotate();
    if (longest > MAX_EDGE) {
      pipeline = pipeline.resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    if (ext === "png") {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true });
    } else if (ext === "webp") {
      pipeline = pipeline.webp({ quality: WEBP_QUALITY });
    } else {
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
    }

    const out = await pipeline.toBuffer();

    // Never store a bigger file than the one that was uploaded.
    if (out.byteLength >= buffer.byteLength) {
      return { buffer, changed: false };
    }
    return { buffer: out, changed: true };
  } catch (error) {
    // A corrupt or exotic image should still be storable as-is rather than
    // failing the whole upload.
    console.error(
      "compressUploadBuffer: falling back to original —",
      error instanceof Error ? error.message : error,
    );
    return { buffer, changed: false };
  }
}
