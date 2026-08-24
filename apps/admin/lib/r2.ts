import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 is the single home for uploaded media. Supabase Storage was
 * dropped because serving originals from it burned through the Free plan
 * egress quota; R2 egress is free and sits behind the Cloudflare edge.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env ${name}`);
  }
  return value;
}

export const R2_BUCKET = process.env.R2_BUCKET || "ecom-media";

/** Public base for object URLs, e.g. https://img.example.com (no trailing slash). */
export function publicBaseUrl(): string {
  return requireEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/, "");
}

let client: S3Client | null = null;

export function r2Client(): S3Client {
  if (client) return client;
  client = new S3Client({
    region: "auto",
    endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
  return client;
}

export function publicUrlForKey(key: string): string {
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `${publicBaseUrl()}/${encoded}`;
}

/** Inverse of publicUrlForKey; null when the URL is not one of ours. */
export function keyFromPublicUrl(url: string): string | null {
  let base: string;
  try {
    base = publicBaseUrl();
  } catch {
    return null;
  }
  if (!url.startsWith(`${base}/`)) return null;
  const raw = url.slice(base.length + 1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export type R2Object = {
  key: string;
  size: number | null;
  lastModified: string | null;
};

/**
 * List one level under `prefix`, mirroring the non-recursive folder listing the
 * Supabase Storage API used to provide.
 */
export async function listObjects(
  prefix: string,
  maxKeys: number,
): Promise<R2Object[]> {
  const normalized = prefix ? `${prefix.replace(/\/+$/, "")}/` : "";

  const result = await r2Client().send(
    new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: normalized || undefined,
      Delimiter: "/",
      MaxKeys: maxKeys,
    }),
  );

  return (result.Contents ?? [])
    .filter((item) => item.Key && item.Key !== normalized)
    .map((item) => ({
      key: item.Key as string,
      size: item.Size ?? null,
      lastModified: item.LastModified?.toISOString() ?? null,
    }));
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string | undefined,
): Promise<void> {
  await r2Client().send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Keys carry a random suffix, so a given key's bytes never change.
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export async function deleteObjects(keys: string[]): Promise<void> {
  if (keys.length === 0) return;

  const result = await r2Client().send(
    new DeleteObjectsCommand({
      Bucket: R2_BUCKET,
      Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
    }),
  );

  const errors = result.Errors ?? [];
  if (errors.length > 0) {
    const detail = errors
      .map((e) => `${e.Key}: ${e.Message ?? e.Code ?? "unknown"}`)
      .join("; ");
    throw new Error(`Failed to delete ${errors.length} object(s) — ${detail}`);
  }
}
