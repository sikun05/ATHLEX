import { handler, ok } from "@/lib/api";
import { clearDemoSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";

export const POST = handler(async () => {
  if (isSupabaseConfigured()) {
    const { getServerSupabase } = await import("@/lib/supabase/server");
    await (await getServerSupabase()).auth.signOut();
  }
  await clearDemoSession();
  return ok({ redirectTo: "/login" });
});
