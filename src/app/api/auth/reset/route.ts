import { ApiError, assertSameOrigin, handler, limit, ok, parseBody } from "@/lib/api";
import { verifyToken } from "@/lib/auth/token";
import { demoSetPassword } from "@/lib/auth/demo";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { resetSchema } from "@/lib/validation";

export const POST = handler(async (req) => {
  await assertSameOrigin(req);
  await limit("reset", 10, 30 * 60_000);
  const { password, token } = await parseBody(req, resetSchema);

  if (isSupabaseConfigured()) {
    // The recovery link (/auth/callback) already exchanged the code for a session.
    const { getServerSupabase } = await import("@/lib/supabase/server");
    const sb = await getServerSupabase();
    const { data } = await sb.auth.getUser();
    if (!data.user) throw new ApiError(401, "Your reset link has expired. Please request a new one.", "LINK_EXPIRED");
    const { error } = await sb.auth.updateUser({ password });
    if (error) throw new ApiError(400, error.message);
    return ok({ redirectTo: "/dashboard" });
  }

  if (!isDemoMode()) throw new ApiError(503, "Not configured");
  const payload = verifyToken<{ uid: string }>(token, "password-reset");
  if (!payload) throw new ApiError(400, "Your reset link is invalid or has expired.", "LINK_EXPIRED");
  demoSetPassword(payload.uid, password);
  return ok({ redirectTo: "/login?reset=1" });
});
