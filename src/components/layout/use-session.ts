"use client";

import { useEffect, useState } from "react";

export type ClientSession = { id: string; name: string; email: string; role: "admin" | "staff" | "trainer" | "member" } | null;

let cached: Promise<ClientSession> | null = null;

/** Lightweight client-side session probe — keeps marketing pages statically rendered. */
export function useSession() {
  const [session, setSession] = useState<ClientSession | undefined>(undefined);
  useEffect(() => {
    cached ??= fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => (j?.data as ClientSession) ?? null)
      .catch(() => null);
    let alive = true;
    cached.then((s) => alive && setSession(s));
    return () => {
      alive = false;
    };
  }, []);
  return session;
}

export const resetSessionCache = () => {
  cached = null;
};
