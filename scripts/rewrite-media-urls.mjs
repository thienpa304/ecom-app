#!/usr/bin/env node
/**
 * Second half of the R2 migration: repoint every stored image URL from the
 * Supabase Storage public prefix to the R2 custom domain.
 *
 * Object keys were preserved during the copy, so this is a pure prefix swap.
 * Run it only after `migrate-media-to-r2.mjs` has finished without failures.
 *
 * Usage:
 *   node scripts/rewrite-media-urls.mjs --dry-run
 *   node scripts/rewrite-media-urls.mjs
 *   node scripts/rewrite-media-urls.mjs --revert     # swap the prefixes back
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const SOURCE_BUCKET = "product-images";
const PAGE_SIZE = 500;

/** Plain text columns holding a single URL. */
const TEXT_COLUMNS = [
  // `product_images` was dropped by 20260720060000_product_media.sql — its rows
  // now live in `product_media`.
  { table: "product_media", columns: ["url", "poster_url"] },
  { table: "posts", columns: ["cover_url"] },
  {
    table: "site_settings",
    columns: ["hero_image_url", "logo_url", "logo_square_url"],
  },
];

/** jsonb columns holding an array of objects with a `url` field. */
const JSON_ARRAY_COLUMNS = [
  { table: "site_settings", column: "hero_slides", urlField: "url" },
];

// ---------------------------------------------------------------- env loading

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
const isRevert = args.includes("--revert");

// ------------------------------------------------------------------- prefixes

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/+$/, "");
const r2PublicBase = requireEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/, "");

const supabasePrefix = `${supabaseUrl}/storage/v1/object/public/${SOURCE_BUCKET}/`;
const r2Prefix = `${r2PublicBase}/`;

const fromPrefix = isRevert ? r2Prefix : supabasePrefix;
const toPrefix = isRevert ? supabasePrefix : r2Prefix;

const supabase = createClient(
  supabaseUrl,
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

// -------------------------------------------------------------------- helpers

function swap(value) {
  if (typeof value !== "string" || !value.startsWith(fromPrefix)) return null;
  return toPrefix + value.slice(fromPrefix.length);
}

async function fetchAllRows(table, columns) {
  const rows = [];
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select(["id", ...columns].join(","))
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`select ${table} failed: ${error.message}`);
    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

async function rewriteTextColumns({ table, columns }) {
  const rows = await fetchAllRows(table, columns);
  let changed = 0;

  for (const row of rows) {
    const patch = {};
    for (const column of columns) {
      const next = swap(row[column]);
      if (next !== null) patch[column] = next;
    }
    if (Object.keys(patch).length === 0) continue;

    changed += 1;
    if (isDryRun) {
      for (const [column, value] of Object.entries(patch)) {
        console.log(`  [dry] ${table}#${row.id}.${column} -> ${value}`);
      }
      continue;
    }

    const { error } = await supabase.from(table).update(patch).eq("id", row.id);
    if (error) {
      throw new Error(`update ${table}#${row.id} failed: ${error.message}`);
    }
  }

  console.log(
    `${table} (${columns.join(", ")}): ${changed} row(s) ${isDryRun ? "would change" : "updated"}`,
  );
  return changed;
}

async function rewriteJsonArrayColumn({ table, column, urlField }) {
  const rows = await fetchAllRows(table, [column]);
  let changed = 0;

  for (const row of rows) {
    const value = row[column];
    if (!Array.isArray(value)) continue;

    let touched = false;
    const next = value.map((entry) => {
      if (!entry || typeof entry !== "object") return entry;
      const swapped = swap(entry[urlField]);
      if (swapped === null) return entry;
      touched = true;
      return { ...entry, [urlField]: swapped };
    });
    if (!touched) continue;

    changed += 1;
    if (isDryRun) {
      console.log(
        `  [dry] ${table}#${row.id}.${column} -> ${JSON.stringify(next)}`,
      );
      continue;
    }

    const { error } = await supabase
      .from(table)
      .update({ [column]: next })
      .eq("id", row.id);
    if (error) {
      throw new Error(`update ${table}#${row.id} failed: ${error.message}`);
    }
  }

  console.log(
    `${table} (${column}): ${changed} row(s) ${isDryRun ? "would change" : "updated"}`,
  );
  return changed;
}

// ----------------------------------------------------------------------- main

async function main() {
  console.log(isDryRun ? "DRY RUN — no writes\n" : "Rewriting stored URLs\n");
  console.log(`from: ${fromPrefix}`);
  console.log(`to  : ${toPrefix}\n`);

  let total = 0;
  for (const spec of TEXT_COLUMNS) {
    total += await rewriteTextColumns(spec);
  }
  for (const spec of JSON_ARRAY_COLUMNS) {
    total += await rewriteJsonArrayColumn(spec);
  }

  console.log(
    `\nTotal: ${total} row(s) ${isDryRun ? "would be changed" : "changed"}`,
  );
  if (!isDryRun && total > 0) {
    console.log(
      "\nRemember to purge the storefront cache (redeploy or revalidate tags).",
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
