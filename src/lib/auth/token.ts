import { createHmac, timingSafeEqual } from "node:crypto";
import { appSecret } from "@/lib/env";

const b64 = (s: string | Buffer) => Buffer.from(s).toString("base64url");

/** Compact HMAC-signed token: base64url(json).signature */
export function signToken(payload: Record<string, unknown>, purpose: string) {
  const body = b64(JSON.stringify(payload));
  const sig = createHmac("sha256", `${appSecret()}:${purpose}`).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken<T extends Record<string, unknown>>(token: string | undefined | null, purpose: string): (T & { exp: number }) | null {
  if (!token || token.length > 2048) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", `${appSecret()}:${purpose}`).update(body).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as T & { exp: number };
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export const DEMO_SESSION_COOKIE = "athlex_demo_session";
