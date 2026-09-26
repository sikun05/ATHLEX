import { ApiError, assertSameOrigin, handler, limit, ok, parseBody } from "@/lib/api";
import { homeFor, setDemoSession } from "@/lib/auth/session";
import { demoVerify } from "@/lib/auth/demo";
import { safeNext } from "@/lib/auth/redirect";
import { getRepo } from "@/lib/db";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { loginSchema } from "@/lib/validation";
import type { Role } from "@/lib/types";

export const POST = handler(async (req) => {
  await assertSameOrigin(req);
  await limit("login", 10, 10 * 60_000);
  const { email, password, next } = await parseBody(req, loginSchema);
  let role: Role = "member";

  if (isSupabaseConfigured()) {
    const { getServerSupabase } = await import("@/lib/supabase/server");
    const sb = await getServerSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      if (error && /confirm/i.test(error.message)) throw new ApiError(403, "Please verify your email first — check your inbox for the link.", "EMAIL_NOT_VERIFIED");
      throw new ApiError(401, "Incorrect email or password.", "INVALID_CREDENTIALS");
    }
    // Same client now carries the session, so RLS lets us read our own profile.
    const { data: profile } = await sb.from("users").select("role, status").eq("id", data.user.id).maybeSingle();
    if (profile?.status && profile.status !== "active") {
      await sb.auth.signOut();
      throw new ApiError(403, "This account is inactive. Please contact the front desk.", "INACTIVE");
    }
    role = (profile?.role as Role) ?? "member";
  } else if (isDemoMode()) {
    const uid = demoVerify(email, password);
    if (!uid) throw new ApiError(401, "Incorrect email or password.", "INVALID_CREDENTIALS");
    await setDemoSession(uid);
    role = ((await (await getRepo()).get("users", uid))?.role as Role) ?? "member";
  } else {
    throw new ApiError(503, "Sign-in is not configured.");
  }

  return ok({ redirectTo: safeNext(next, homeFor(role), role) });
});
