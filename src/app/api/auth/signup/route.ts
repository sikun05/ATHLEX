import { ApiError, assertSameOrigin, handler, limit, ok, parseBody } from "@/lib/api";
import { setDemoSession } from "@/lib/auth/session";
import { demoSignup } from "@/lib/auth/demo";
import { safeNext } from "@/lib/auth/redirect";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { notify, notifyAdmin } from "@/lib/notifications";
import { site } from "@/lib/site";
import { signupSchema } from "@/lib/validation";

export const POST = handler(async (req) => {
  await assertSameOrigin(req);
  await limit("signup", 5, 30 * 60_000);
  const input = await parseBody(req, signupSchema);
  const next = safeNext(input.next, "/dashboard", "member");

  if (isSupabaseConfigured()) {
    const { getServerSupabase } = await import("@/lib/supabase/server");
    const sb = await getServerSupabase();
    const { data, error } = await sb.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { full_name: input.fullName, phone: input.phone },
        emailRedirectTo: `${site.url}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) throw new ApiError(400, /registered|exists/i.test(error.message) ? "An account with this email already exists." : error.message, "SIGNUP_FAILED");
    // Supabase returns a user with no identities when the email is taken (anti-enumeration)
    const needsVerification = !data.session;
    await notifyAdmin("New registration", `${input.fullName} (${input.email}) created an account.`, "registration");
    return ok({ needsVerification, redirectTo: needsVerification ? `/verify-email?email=${encodeURIComponent(input.email)}` : next }, { status: 201 });
  }

  if (!isDemoMode()) throw new ApiError(503, "Sign-up is not configured.");
  const res = await demoSignup({ email: input.email, password: input.password, fullName: input.fullName, phone: input.phone });
  if ("error" in res) throw new ApiError(409, res.error!, "EXISTS");
  await setDemoSession(res.userId);
  await notify("registration", { userId: res.userId, email: input.email, phone: input.phone }, { name: input.fullName.split(" ")[0] });
  await notifyAdmin("New registration", `${input.fullName} (${input.email}) created an account.`, "registration");
  return ok({ needsVerification: false, redirectTo: next }, { status: 201 });
});
