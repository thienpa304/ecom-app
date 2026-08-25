#!/usr/bin/env node
/**
 * Move schema + data from the current Supabase project to a new one.
 *
 * Storage is already on Cloudflare R2 and Auth is unused, so Postgres is the
 * only thing left to move. Schema comes from supabase/migrations replayed in
 * order; data is copied row by row through PostgREST, which means no pg_dump,
 * no Supabase CLI and no database password.
 *
 * Needs a personal access token (https://supabase.com/dashboard/account/tokens)
 * for the account that owns the TARGET project, as SUPABASE_ACCESS_TOKEN.
 * The target project's API keys are fetched with it and appended to
 * apps/admin/.env.local; they are never printed.
 *
 * Usage:
 *   node scripts/migrate-to-new-project.mjs --keys
 *   node scripts/migrate-to-new-project.mjs --schema
 *   node scripts/migrate-to-new-project.mjs --data
 *   node scripts/migrate-to-new-project.mjs --verify
 *   node scripts/migrate-to-new-project.mjs --all
 */

import { appendFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const ENV_FILE = resolve(ROOT, "apps/admin/.env.local");
const MIGRATIONS_DIR = resolve(ROOT, "supabase/migrations");

const MANAGEMENT_API = "https://api.supabase.com";
const COPY_CHUNK = 200;
const PAGE_SIZE = 1000;

/** Parents before children so foreign keys resolve. */
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

/** Generated columns cannot be inserted. */
const SKIP_COLUMNS = {
  products: ["effective_price"],
};

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

loadEnvFile(ENV_FILE);
loadEnvFile(resolve(ROOT, ".env.local"));

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env ${name}. Add it to ${ENV_FILE}`);
  return value;
}

// ------------------------------------------------------------------ arg parse

const args = process.argv.slice(2);
const all = args.includes("--all");
const doKeys = all || args.includes("--keys");
const doSchema = all || args.includes("--schema");
const doData = all || args.includes("--data");
const doVerify = all || args.includes("--verify");

if (!doKeys && !doSchema && !doData && !doVerify) {
  console.error(
    "Nothing to do. Pass --keys, --schema, --data, --verify or --all.",
  );
  process.exit(1);
}

const targetRef = requireEnv("NEW_SUPABASE_PROJECT_REF");

// ------------------------------------------------------------- management API

async function management(path, init = {}) {
  const res = await fetch(`${MANAGEMENT_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireEnv("SUPABASE_ACCESS_TOKEN")}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `${init.method ?? "GET"} ${path} -> ${res.status} ${text.slice(0, 400)}`,
    );
  }
  return text ? JSON.parse(text) : null;
}

/** Fetch the target project's API keys and append them to .env.local. */
async function stepKeys() {
  console.log("== keys ==");

  if (process.env.NEW_SUPABASE_SERVICE_ROLE_KEY) {
    console.log("  NEW_SUPABASE_* already present, skipping");
    return;
  }

  const keys = await management(`/v1/projects/${targetRef}/api-keys?reveal=true`);
  const find = (name) => keys.find((k) => k.name === name)?.api_key;

  const anon = find("anon");
  const service = find("service_role");
  if (!anon || !service) {
    throw new Error(
      `Could not find anon/service_role in api-keys response (got: ${keys
        .map((k) => k.name)
        .join(", ")})`,
    );
  }

  appendFileSync(
    ENV_FILE,
    [
      "",
      "# --- New Supabase project (migration target) ---",
      `NEW_SUPABASE_URL=https://${targetRef}.supabase.co`,
      `NEW_SUPABASE_ANON_KEY=${anon}`,
      `NEW_SUPABASE_SERVICE_ROLE_KEY=${service}`,
      "",
    ].join("\n"),
  );

  process.env.NEW_SUPABASE_URL = `https://${targetRef}.supabase.co`;
  process.env.NEW_SUPABASE_ANON_KEY = anon;
  process.env.NEW_SUPABASE_SERVICE_ROLE_KEY = service;

  console.log(
    `  wrote NEW_SUPABASE_URL / _ANON_KEY / _SERVICE_ROLE_KEY to ${ENV_FILE}`,
  );
}

/** Replay every migration file, in filename order, against the target. */
async function stepSchema() {
  console.log("== schema ==");

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = readFileSync(resolve(MIGRATIONS_DIR, file), "utf8");
    try {
      await management(`/v1/projects/${targetRef}/database/query`, {
        method: "POST",
        body: JSON.stringify({ query: sql }),
      });
      console.log(`  ok   ${file}`);
    } catch (error) {
      console.error(`  FAIL ${file}`);
      throw error;
    }
  }

  console.log(`  replayed ${files.length} migration(s)`);
}

// ------------------------------------------------------------------ data copy

function clientFor(url, key) {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function readAll(client, table) {
  const rows = [];
  let from = 0;
  for (;;) {
    const { data, error } = await client
      .from(table)
      .select("*")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`read ${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

function stripGenerated(table, rows) {
  const skip = SKIP_COLUMNS[table];
  if (!skip) return rows;
  return rows.map((row) => {
    const copy = { ...row };
    for (const col of skip) delete copy[col];
    return copy;
  });
}

async function stepData() {
  console.log("== data ==");

  const source = clientFor(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  );
  const target = clientFor(
    requireEnv("NEW_SUPABASE_URL"),
    requireEnv("NEW_SUPABASE_SERVICE_ROLE_KEY"),
  );

  for (const table of TABLES) {
    const rows = stripGenerated(table, await readAll(source, table));
    if (rows.length === 0) {
      console.log(`  ${table.padEnd(16)} 0 row(s), nothing to copy`);
      continue;
    }

    for (let i = 0; i < rows.length; i += COPY_CHUNK) {
      const chunk = rows.slice(i, i + COPY_CHUNK);
      const { error } = await target.from(table).upsert(chunk);
      if (error) {
        throw new Error(
          `write ${table} [${i}..${i + chunk.length - 1}]: ${error.message}`,
        );
      }
    }
    console.log(`  ${table.padEnd(16)} ${rows.length} row(s) copied`);
  }
}

async function stepVerify() {
  console.log("== verify ==");

  const source = clientFor(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  );
  const target = clientFor(
    requireEnv("NEW_SUPABASE_URL"),
    requireEnv("NEW_SUPABASE_SERVICE_ROLE_KEY"),
  );

  const count = async (client, table) => {
    const { count: n, error } = await client
      .from(table)
      .select("*", { count: "exact", head: true });
    if (error) throw new Error(`count ${table}: ${error.message}`);
    return n ?? 0;
  };

  let mismatched = 0;
  for (const table of TABLES) {
    const [a, b] = await Promise.all([
      count(source, table),
      count(target, table),
    ]);
    if (a !== b) mismatched += 1;
    console.log(
      `  ${a === b ? "ok  " : "DIFF"} ${table.padEnd(16)} old=${a}  new=${b}`,
    );
  }

  if (mismatched > 0) {
    console.error(`\n${mismatched} table(s) differ.`);
    process.exitCode = 1;
  } else {
    console.log("\nAll tables match.");
  }
}

// ----------------------------------------------------------------------- main

async function main() {
  console.log(`Target project: ${targetRef}\n`);
  if (doKeys) await stepKeys();
  if (doSchema) await stepSchema();
  if (doData) await stepData();
  if (doVerify) await stepVerify();
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
