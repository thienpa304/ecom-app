import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env ${name}`);
  }
  return value;
}

/**
 * Server Supabase client for admin CRUD.
 * Prefers SERVICE_ROLE_KEY (bypasses RLS — needed for storage uploads & writes).
 * Falls back to anon key if service role is not set.
 */
export function createServerClient(): SupabaseClient {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = serviceKey || requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const PRODUCT_IMAGES_BUCKET = "product-images";
