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

  // getUser() validates the JWT locally — no extra DB round-trip
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

  // ── Admin routes — require profiles.is_admin = true ──────────
  if (pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
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
  ],
};
