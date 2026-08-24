#!/usr/bin/env node
/**
 * Dump every table to local JSON.
 *
 * The Free plan does not expose downloadable backups, and the schema is
 * already versioned in supabase/migrations, so a data-only dump plus the
 * migration files is a complete restore path.
 *
 * Usage:
 *   node scripts/backup-db.mjs
 *   node scripts/backup-db.mjs --out=D:\backups
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const PAGE_SIZE = 1000;

/**
 * Ordered so a restore can replay them top to bottom without tripping foreign
 * keys: parents before the rows that reference them.
 */
const TABLES = [
  "categories",
  "brands",
  "products",
  "product_media",
  "posts",
  "policy_pages",
  "site_settings",
  "home_sections",
  "leads",
  "media_labels",
];

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

const args = process.argv.slice(2);
const outArg = args.find((a) => a.startsWith("--out="));

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/+$/, "");
const projectRef =
  supabaseUrl.replace(/^https?:\/\//, "").split(".")[0] || "unknown";

const supabase = createClient(
  supabaseUrl,
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function dumpTable(table) {
  const rows = [];
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`select ${table} failed: ${error.message}`);
    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

async function main() {
  const takenAt = new Date().toISOString();
  const stamp = takenAt.replace(/[:.]/g, "-");
  const outDir = outArg
    ? resolve(outArg.slice("--out=".length), stamp)
    : resolve(ROOT, "backups", stamp);

  mkdirSync(outDir, { recursive: true });
  console.log(`Backing up ${projectRef} -> ${outDir}\n`);

  const counts = {};
  const failed = [];

  for (const table of TABLES) {
    try {
      const rows = await dumpTable(table);
      writeFileSync(
        resolve(outDir, `${table}.json`),
        JSON.stringify(rows, null, 2),
      );
      counts[table] = rows.length;
      console.log(`  ${table.padEnd(16)} ${rows.length} row(s)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failed.push({ table, error: message });
      console.error(`  ${table.padEnd(16)} FAILED - ${message}`);
    }
  }

  writeFileSync(
    resolve(outDir, "_manifest.json"),
    JSON.stringify(
      {
        takenAt,
        projectRef,
        // Restore order; replay these top to bottom.
        tables: counts,
        failed,
        note:
          "Data-only dump. Recreate the schema from supabase/migrations first, " +
          "then load these files in the order listed above. products.effective_price " +
          "is a generated column and must not be inserted.",
      },
      null,
      2,
    ),
  );

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`\n${total} row(s) across ${Object.keys(counts).length} table(s)`);
  console.log(`Manifest: ${resolve(outDir, "_manifest.json")}`);

  if (failed.length > 0) {
    console.error(`\n${failed.length} table(s) failed - backup is incomplete.`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
