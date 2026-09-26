import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { getRepo, eq } from "@/lib/db";
import { DEMO_SESSION_COOKIE, signToken, verifyToken } from "./token";
import type { Role } from "@/lib/types";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  memberId: string | null;
  trainerId: string | null;
  emailVerified: boolean;
};

const SESSION_DAYS = 7;

export async function setDemoSession(userId: string) {
  const store = await cookies();
  const token = signToken({ uid: userId, exp: Date.now() + SESSION_DAYS * 86_400_000 }, "demo-session");
  store.set(DEMO_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function clearDemoSession() {
  (await cookies()).delete(DEMO_SESSION_COOKIE);
}

async function hydrate(id: string, email: string, emailVerified: boolean): Promise<SessionUser | null> {
  const repo = await getRepo("user");
  const profile = await repo.get("users", id);
  if (!profile || profile.deleted_at || profile.status !== "active") return null;
  const member = await repo.findOne("members", [eq("user_id", id)]);
  const trainer = profile.role === "trainer" ? await repo.findOne("trainers", [eq("user_id", id)]) : null;
  return {
    id,
    email,
    name: profile.full_name || email.split("@")[0],
    phone: profile.phone ?? null,
    role: profile.role as Role,
    memberId: member?.id ?? null,
    trainerId: trainer?.id ?? null,
    emailVerified,
  };
}

/** Resolve the signed-in user for this request (memoised per request). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  // Always read cookies first so every caller is request-bound (never statically prerendered).
  const store = await cookies();
  if (isSupabaseConfigured()) {
    const { getServerSupabase } = await import("@/lib/supabase/server");
    const sb = await getServerSupabase();
    const { data } = await sb.auth.getUser();
    if (!data.user) return null;
    return hydrate(data.user.id, data.user.email ?? "", Boolean(data.user.email_confirmed_at));
  }
  if (!isDemoMode()) return null;
  const token = store.get(DEMO_SESSION_COOKIE)?.value;
  const payload = verifyToken<{ uid: string }>(token, "demo-session");
  if (!payload) return null;
  const repo = await getRepo();
  const user = await repo.get("users", payload.uid);
  if (!user) return null;
  return hydrate(user.id, user.email, true);
});

export const STAFF_ROLES: Role[] = ["admin", "staff"];
export const DESK_ROLES: Role[] = ["admin", "staff", "trainer"];

/** For Server Components/pages: redirect when not allowed. */
export async function requireUser(roles?: Role[], next = "/dashboard") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (roles && !roles.includes(user.role)) redirect(user.role === "member" ? "/dashboard" : "/admin");
  return user;
}

export const homeFor = (role: Role) => (role === "member" ? "/dashboard" : "/admin");
