import { z } from "zod";
import { ApiError, assertSameOrigin, authorize, handler, limit, ok, parseBody } from "@/lib/api";
import { demoSetPassword, demoVerify } from "@/lib/auth/demo";
import { isSupabaseConfigured } from "@/lib/env";
import { password } from "@/lib/validation";

export const POST = handler(async (req) => {
  await assertSameOrigin(req);
  const user = await authorize();
  await limit("pw", 5, 15 * 60_000);
  const { currentPassword, newPassword } = await parseBody(req, z.object({ currentPassword: z.string().min(1), newPassword: password }));

  if (isSupabaseConfigured()) {
    const { getServerSupabase } = await import("@/lib/supabase/server");
    const sb = await getServerSupabase();
    // Re-authenticate before changing credentials
    const { error: reauth } = await sb.auth.signInWithPassword({ email: user.email, password: currentPassword });
    if (reauth) throw new ApiError(400, "Current password is incorrect.", "BAD_PASSWORD", { currentPassword: ["Incorrect password"] });
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) throw new ApiError(400, error.message);
  } else {
    if (demoVerify(user.email, currentPassword) !== user.id) throw new ApiError(400, "Current password is incorrect.", "BAD_PASSWORD", { currentPassword: ["Incorrect password"] });
    demoSetPassword(user.id, newPassword);
  }
  return ok({ changed: true });
});
