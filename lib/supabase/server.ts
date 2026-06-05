import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Server Supabase client — use in Server Components, Route Handlers, and Server Actions.
 * Creates a new instance per request (cookies are request-scoped in Next.js App Router).
 * Does NOT use the service role key.
 *
 * Usage:
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('listings').select()
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — cookie mutation is expected to
            // fail here and is safe to ignore. The middleware (proxy.ts) handles
            // session refresh for the next request.
          }
        },
      },
    }
  );
}
