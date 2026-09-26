import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { DEMO_SESSION_COOKIE, verifyToken } from "@/lib/auth/token";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";

const PROTECTED = [/^\/dashboard(\/|$)/, /^\/admin(\/|$)/];

/**
 * 1. Refreshes the Supabase auth session cookie on every request.
 * 2. Redirects anonymous visitors away from member/admin areas.
 * Role checks (admin vs member) happen server-side in the route layouts & APIs.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let signedIn = false;

  if (isSupabaseConfigured()) {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet, headers) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    signedIn = Boolean(data.user);
  } else if (isDemoMode()) {
    signedIn = Boolean(verifyToken(request.cookies.get(DEMO_SESSION_COOKIE)?.value, "demo-session"));
  }

  const path = request.nextUrl.pathname;
  if (!signedIn && PROTECTED.some((r) => r.test(path))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  if (PROTECTED.some((r) => r.test(path))) response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|mp4|woff2?)$).*)"],
};
