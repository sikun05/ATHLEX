import { handler, limit, ok, parseBody } from "@/lib/api";
import { isSupabaseConfigured } from "@/lib/env";
import { site } from "@/lib/site";
import { forgotSchema } from "@/lib/validation";

export const POST = handler(async (req) => {
  await limit("resend", 3, 10 * 60_000);
  const { email } = await parseBody(req, forgotSchema);
  if (isSupabaseConfigured()) {
    const { getServerSupabase } = await import("@/lib/supabase/server");
    await (await getServerSupabase()).auth.resend({ type: "signup", email, options: { emailRedirectTo: `${site.url}/auth/callback?next=/dashboard` } });
  }
  return ok({ sent: true });
});
