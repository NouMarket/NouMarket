import "server-only"; // Build-time error if imported from any client-side module

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Admin Supabase client — uses the SERVICE ROLE KEY.
 *
 * ⚠️  SECURITY RULES:
 *   - This file is guarded by `import 'server-only'`.
 *     Any attempt to import it from a Client Component or shared browser
 *     module will cause a hard build error.
 *   - SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_ prefix and is therefore
 *     never included in any client bundle.
 *   - Only import this client from:
 *       app/actions/listings.ts  (admin approve/reject)
 *       app/admin/**             (server-side admin pages)
 *   - Never import from components/, app/api/ routes accessible without auth,
 *     or any "use client" file.
 *
 * This client bypasses Row Level Security. Use it only for operations that
 * require elevated privileges (admin moderation, server-side aggregations).
 */
export const adminSupabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
