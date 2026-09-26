import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNext } from "@/lib/auth/redirect";

/** Handles email verification, magic-link and password-recovery redirects (PKCE code exchange). */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const next = safeNext(url.searchParams.get("next"), "/dashboard");
  const code = url.searchParams.get("code");
  if (code && isSupabaseConfigured()) {
    const { getServerSupabase } = await import("@/lib/supabase/server");
    const { error } = await (await getServerSupabase()).auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
