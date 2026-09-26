import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNext } from "@/lib/auth/redirect";

/** Token-hash confirmation (use with Supabase email templates: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email). */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(url.searchParams.get("next"), type === "recovery" ? "/reset-password" : "/dashboard");
  if (tokenHash && type && isSupabaseConfigured()) {
    const { getServerSupabase } = await import("@/lib/supabase/server");
    const { error } = await (await getServerSupabase()).auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
