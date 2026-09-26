import { handler, limit, ok, parseBody } from "@/lib/api";
import { signToken } from "@/lib/auth/token";
import { demoFindUserIdByEmail } from "@/lib/auth/demo";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { site } from "@/lib/site";
import { forgotSchema } from "@/lib/validation";

/** Always responds the same way so attackers can't discover which emails have accounts. */
export const POST = handler(async (req) => {
  await limit("forgot", 5, 30 * 60_000);
  const { email } = await parseBody(req, forgotSchema);

  if (isSupabaseConfigured()) {
    const { getServerSupabase } = await import("@/lib/supabase/server");
    const sb = await getServerSupabase();
    await sb.auth.resetPasswordForEmail(email, { redirectTo: `${site.url}/auth/callback?next=/reset-password` });
    return ok({ sent: true });
  }

  if (isDemoMode()) {
    const uid = demoFindUserIdByEmail(email);
    if (uid) {
      const token = signToken({ uid, exp: Date.now() + 30 * 60_000 }, "password-reset");
      const link = `/reset-password?token=${encodeURIComponent(token)}`;
      console.info(`[demo] password reset link for ${email}: ${link}`);
      // Demo mode has no inbox, so surface the link to make the flow testable.
      return ok({ sent: true, demoLink: link });
    }
  }
  return ok({ sent: true });
});
