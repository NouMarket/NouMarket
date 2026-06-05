/**
 * Re-export barrel — import Supabase clients from here or directly from their files.
 *
 * Client Components:  import { createClient } from "@/lib/supabase/client"
 * Server Components:  import { createClient } from "@/lib/supabase/server"
 * Admin actions only: import { adminSupabase } from "@/lib/supabase/admin"
 */
export { createClient as createBrowserClient } from "./supabase/client";
export { createClient as createServerClient } from "./supabase/server";
