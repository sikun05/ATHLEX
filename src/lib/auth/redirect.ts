import type { Role } from "@/lib/types";

/** Only allow same-site relative redirects; keep members out of /admin. */
export function safeNext(next: string | undefined | null, fallback: string, role?: Role) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  if (next.startsWith("/admin") && role === "member") return "/dashboard";
  if (/^\/(login|signup|forgot-password)/.test(next)) return fallback;
  return next;
}
