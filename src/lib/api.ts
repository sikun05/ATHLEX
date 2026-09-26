import "server-only";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z, ZodError, type ZodType } from "zod";
import { getCurrentUser, type SessionUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import type { Role } from "@/lib/types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const ok = <T>(data: T, init?: ResponseInit) => NextResponse.json({ ok: true, data }, init);

export function fail(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json({ ok: false, error: err.message, code: err.code, details: err.details }, { status: err.status });
  }
  if (err instanceof ZodError) {
    return NextResponse.json({ ok: false, error: "Please check the highlighted fields.", code: "VALIDATION", details: z.flattenError(err).fieldErrors }, { status: 422 });
  }
  console.error("[api]", err);
  return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
}

/** Wrap a handler with uniform error handling. */
export function handler<Ctx = unknown>(fn: (req: Request, ctx: Ctx) => Promise<Response>) {
  return async (req: Request, ctx: Ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      return fail(err);
    }
  };
}

export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
  return schema.parse(json);
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function limit(key: string, max: number, windowMs: number) {
  const ip = await clientIp();
  const res = rateLimit(`${key}:${ip}`, max, windowMs);
  if (!res.ok) throw new ApiError(429, "Too many requests. Please wait a moment and try again.", "RATE_LIMITED");
}

export async function authorize(roles?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Please sign in to continue.", "UNAUTHENTICATED");
  if (roles && !roles.includes(user.role)) throw new ApiError(403, "You don't have permission to do that.", "FORBIDDEN");
  return user;
}

/** Reject cross-site form posts for cookie-authenticated mutations. */
export async function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = (await headers()).get("host");
  if (host && new URL(origin).host !== host) throw new ApiError(403, "Cross-origin request blocked", "CSRF");
}
