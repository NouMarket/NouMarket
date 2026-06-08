"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/types/database";

interface AuthContextValue {
  user: User | null;
  profile: ProfileRow | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // createBrowserClient is a singleton (same URL+key → same instance).
  // useMemo keeps the reference stable across renders so useEffect deps
  // don't cause spurious re-subscriptions.
  const supabase = useMemo(() => createClient(), []);
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data ?? null);
    },
    [supabase]
  );

  // ── Initial hydration + cross-tab listener ──────────────────────────────
  // getUser() validates the JWT with the Supabase server (authoritative).
  // onAuthStateChange covers tab-focus token refresh, cross-tab sign-out,
  // and client-side OAuth flows that call the browser SDK directly.
  useEffect(() => {
    void supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ?? null);
      if (u) {
        void fetchProfile(u.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        void fetchProfile(nextUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  // ── Post-navigation cookie re-sync ──────────────────────────────────────
  // Server actions (signIn / signOut) write session cookies via the SSR
  // client WITHOUT triggering onAuthStateChange on the browser client —
  // the browser GoTrue instance never receives a SIGNED_IN / SIGNED_OUT
  // signal because the auth call happened entirely on the server.
  //
  // After a server-action redirect the Next.js router does a soft navigation
  // (no page remount), so AuthProvider keeps its stale React state.
  //
  // Fix: on every pathname change, read the session from document.cookie via
  // getSession(). This is local for valid non-expired tokens — no extra
  // round-trip. If the user changed, update React state and re-fetch profile.
  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      const nextUser = session?.user ?? null;
      // Functional updater reads previous state without a stale closure,
      // so we safely skip re-renders when nothing changed.
      setUser((prev) => {
        if (prev?.id === nextUser?.id) return prev; // no change
        if (nextUser) void fetchProfile(nextUser.id);
        else setProfile(null);
        return nextUser;
      });
    });
    // pathname is the sole intended trigger.
    // supabase is a stable singleton; fetchProfile is a stable useCallback.
    // Adding them to the array would not change behaviour but could confuse
    // future readers into thinking they are meaningful triggers here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
