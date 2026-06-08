import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Route protection proxy (Next.js 16 — replaces deprecated middleware.ts).
 *
 * Protected routes:
 *   /create/**    — must be authenticated
 *   /profile/**   — must be authenticated
 *   /favorites/** — must be authenticated
 *   /messages/**  — must be authenticated
 *   /admin/**     — must be authenticated AND profiles.is_admin = true
 *
 * Unauthenticated requests are redirected to /login?next=<original-path>.
 * Non-admin requests to /admin are redirected to /.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build a response we can attach updated cookies to
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Create a Supabase client that reads/writes the request cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write refreshed session cookies back to both request and response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() validates the JWT with the Supabase auth server (authoritative).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Unauthenticated ──────────────────────────────────────────
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Profile existence check — all protected routes ────────────
  // auth.users controls the Supabase session; public.profiles controls the
  // NouMarket account identity. A missing profiles row means the account was
  // deleted (e.g. by an admin) while the session cookie remained valid.
  // Redirect to /login for all protected routes in this case.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Admin routes — require profiles.is_admin = true ──────────
  if (pathname.startsWith("/admin")) {
    if (!profile.is_admin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/create/:path*",
    "/profile/:path*",
    "/favorites/:path*",
    "/messages/:path*",
    "/notifications/:path*",
  ],
};
