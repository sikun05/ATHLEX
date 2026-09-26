/** Central feature flags derived from environment variables. Server-safe; no secrets leave this module. */
export const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const isServiceRoleConfigured = () => isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

export const isRazorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

/**
 * Demo mode = no Supabase configured. Allowed automatically in development, and in
 * production only when DEMO_MODE=true (e.g. preview deployments).
 */
export const isDemoMode = () =>
  !isSupabaseConfigured() && (process.env.NODE_ENV !== "production" || process.env.DEMO_MODE === "true");

export const isBackendAvailable = () => isSupabaseConfigured() || isDemoMode();

export function appSecret() {
  const s = process.env.APP_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production" && !isDemoMode()) {
    throw new Error("APP_SECRET (min 32 chars) must be set in production");
  }
  return "athlex-dev-only-secret-change-me-please-0000";
}
