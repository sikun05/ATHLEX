import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { demoRepo } from "./demo-store";
import { supabaseRepo } from "./supabase-repo";
import type { Repo } from "./types";

export * from "./types";

/**
 * Repository for the current request.
 * - "user"       → runs as the signed-in user; Supabase RLS enforces access.
 * - "public"     → anonymous; only publicly readable rows.
 * - "privileged" → service role; bypasses RLS. Only after explicit authorization checks.
 */
export async function getRepo(mode: "user" | "public" | "privileged" = "user"): Promise<Repo> {
  if (!isSupabaseConfigured()) return demoRepo;
  const { getServerSupabase, getPublicSupabase, getAdminSupabase } = await import("@/lib/supabase/server");
  if (mode === "privileged") return supabaseRepo(getAdminSupabase());
  if (mode === "public") return supabaseRepo(getPublicSupabase());
  return supabaseRepo(await getServerSupabase());
}
