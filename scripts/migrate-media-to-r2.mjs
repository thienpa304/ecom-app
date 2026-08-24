#!/usr/bin/env node
/**
 * One-off migration: copy every object from the Supabase `product-images`
 * bucket into Cloudflare R2, shrinking oversized raster images on the way.
 *
 * Object keys are preserved byte-for-byte (same folders, same extensions), so
 * rewriting the stored URLs afterwards is a pure prefix swap and
 * `media_labels.storage_path` keeps matching. Format conversion is left to
 * next/image, which serves AVIF/WebP from these originals.
 *
 * Usage:
 *   node scripts/migrate-media-to-r2.mjs --dry-run
 *   node scripts/migrate-media-to-r2.mjs
 *   node scripts/migrate-media-to-r2.mjs --only=products/abc.jpg
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const REPORT_DIR = resolve(HERE, ".migration");
const REPORT_FILE = resolve(REPORT_DIR, "r2-migration-report.json");

const SOURCE_BUCKET = "product-images";
/** Longest edge kept for raster images. Storefront never renders above 1200px. */
const MAX_EDGE = 1600;
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 82;
/** Below this, recompression is not worth the quality loss. */
const SKIP_SHRINK_UNDER_BYTES = 60 * 1024;
const LIST_PAGE_SIZE = 100;
const UPLOAD_CONCURRENCY = 6;

const RASTER_EXT = new Set(["jpg", "jpeg", "png", "webp"]);
const PASSTHROUGH_EXT = new Set([
  "svg",
  "gif",
  "avif",
  "bmp",
  "ico",
  "mp4",
  "webm",
  "mov",
  "ogg",
  "m4v",
]);

const CONTENT_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  ico: "image/x-icon",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  ogg: "video/ogg",
  m4v: "video/x-m4v",
};

// ---------------------------------------------------------------- env loading

/** Minimal .env.local reader — avoids adding a dotenv dependency. */
function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (process.env[key]) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(resolve(ROOT, "apps/admin/.env.local"));
loadEnvFile(resolve(ROOT, ".env.local"));

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing env ${name}. Add it to apps/admin/.env.local or .env.local`,
    );
  }
  return value;
}

// ------------------------------------------------------------------ arg parse

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const onlyArg = args.find((a) => a.startsWith("--only="));
const onlyKey = onlyArg ? onlyArg.slice("--only=".length) : null;

// -------------------------------------------------------------------- clients

const supabase = createClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
  },
});
const R2_BUCKET = requireEnv("R2_BUCKET");

// ------------------------------------------------------------------- helpers

function extOf(key) {
  return key.split(".").pop()?.toLowerCase() ?? "";
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Walk the bucket depth-first. Supabase `list` is not recursive, and entries
 * without an `id` are folders.
 */
async function listAllObjects(prefix = "") {
  const found = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase.storage
      .from(SOURCE_BUCKET)
      .list(prefix, { limit: LIST_PAGE_SIZE, offset });

    if (error) {
      throw new Error(`list("${prefix}") failed: ${error.message}`);
    }
    if (!data || data.length === 0) break;

    for (const entry of data) {
      const key = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null || entry.id === undefined) {
        found.push(...(await listAllObjects(key)));
      } else {
        found.push({ key, size: entry.metadata?.size ?? null });
      }
    }

    if (data.length < LIST_PAGE_SIZE) break;
    offset += LIST_PAGE_SIZE;
  }

  return found;
}

/**
 * Shrink a raster image if it is larger than MAX_EDGE on its longest edge.
 * Returns the original buffer untouched when shrinking would not help.
 */
async function shrinkIfOversized(buffer, ext) {
  if (!RASTER_EXT.has(ext)) return { buffer, note: "passthrough" };
  if (buffer.byteLength < SKIP_SHRINK_UNDER_BYTES) {
    return { buffer, note: "already small" };
  }

  const image = sharp(buffer, { failOn: "none" });
  const meta = await image.metadata();
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0);

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

  // Never ship a bigger file than we started with.
  if (out.byteLength >= buffer.byteLength) {
    return { buffer, note: "recompress not smaller" };
  }
  return {
    buffer: out,
    note: longest > MAX_EDGE ? `resized from ${longest}px` : "recompressed",
  };
}

async function migrateOne(object) {
  const ext = extOf(object.key);

  const { data, error } = await supabase.storage
    .from(SOURCE_BUCKET)
    .download(object.key);
  if (error) throw new Error(`download failed: ${error.message}`);

  const original = Buffer.from(await data.arrayBuffer());

  let processed = original;
  let note = "passthrough";
  if (RASTER_EXT.has(ext)) {
    const result = await shrinkIfOversized(original, ext);
    processed = result.buffer;
    note = result.note;
  } else if (!PASSTHROUGH_EXT.has(ext)) {
    note = "unknown type, copied as-is";
  }

  if (!isDryRun) {
    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: object.key,
        Body: processed,
        ContentType: CONTENT_TYPES[ext] ?? "application/octet-stream",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  }

  return {
    key: object.key,
    beforeBytes: original.byteLength,
    afterBytes: processed.byteLength,
    note,
  };
}

/** Run tasks with a fixed worker pool so we don't hammer either service. */
async function runPooled(items, worker, concurrency) {
  const results = [];
  let cursor = 0;

  async function pump() {
    for (;;) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, pump),
  );
  return results;
}

// ----------------------------------------------------------------------- main

async function main() {
  console.log(
    isDryRun
      ? "DRY RUN — reading and compressing, nothing uploaded\n"
      : `Migrating ${SOURCE_BUCKET} -> R2 bucket "${R2_BUCKET}"\n`,
  );

  let objects = await listAllObjects();
  if (onlyKey) objects = objects.filter((o) => o.key === onlyKey);

  if (objects.length === 0) {
    console.log("No objects found. Nothing to do.");
    return;
  }

  const knownBytes = objects.reduce((sum, o) => sum + (o.size ?? 0), 0);
  console.log(
    `Found ${objects.length} objects (${formatBytes(knownBytes)} reported by Supabase)\n`,
  );

  const succeeded = [];
  const failed = [];
  let done = 0;

  await runPooled(
    objects,
    async (object) => {
      try {
        const result = await migrateOne(object);
        succeeded.push(result);
        done += 1;
        const saved = result.beforeBytes - result.afterBytes;
        console.log(
          `[${done}/${objects.length}] ${result.key} ` +
            `${formatBytes(result.beforeBytes)} -> ${formatBytes(result.afterBytes)}` +
            (saved > 0
              ? ` (-${formatBytes(saved)}, ${result.note})`
              : ` (${result.note})`),
        );
      } catch (error) {
        done += 1;
        const message = error instanceof Error ? error.message : String(error);
        failed.push({ key: object.key, error: message });
        console.error(
          `[${done}/${objects.length}] FAILED ${object.key}: ${message}`,
        );
      }
    },
    UPLOAD_CONCURRENCY,
  );

  const beforeTotal = succeeded.reduce((s, r) => s + r.beforeBytes, 0);
  const afterTotal = succeeded.reduce((s, r) => s + r.afterBytes, 0);

  console.log("\n--- Summary ---");
  console.log(`Migrated : ${succeeded.length}`);
  console.log(`Failed   : ${failed.length}`);
  console.log(`Before   : ${formatBytes(beforeTotal)}`);
  console.log(`After    : ${formatBytes(afterTotal)}`);
  if (beforeTotal > 0) {
    const pct = ((1 - afterTotal / beforeTotal) * 100).toFixed(1);
    console.log(
      `Saved    : ${formatBytes(beforeTotal - afterTotal)} (${pct}%)`,
    );
  }

  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(
    REPORT_FILE,
    JSON.stringify(
      {
        ranAt: new Date().toISOString(),
        dryRun: isDryRun,
        sourceBucket: SOURCE_BUCKET,
        targetBucket: R2_BUCKET,
        totals: { beforeBytes: beforeTotal, afterBytes: afterTotal },
        succeeded,
        failed,
      },
      null,
      2,
    ),
  );
  console.log(`\nReport written to ${REPORT_FILE}`);

  if (failed.length > 0) {
    console.error(
      `\n${failed.length} object(s) failed. Re-run with --only=<key> to retry individually.`,
    );
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
