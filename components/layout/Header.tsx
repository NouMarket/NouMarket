"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Menu, X, Heart, User, Plus, ChevronDown, LogOut, MessageCircle } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { SITE_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { signOut } from "@/app/actions/auth";
import Button from "@/components/ui/Button";
import UnreadBadge from "@/components/messages/UnreadBadge";

export default function Header() {
  const { user, profile, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const displayName = profile?.name ?? user?.email?.split("@")[0] ?? "";
  const initials = displayName.charAt(0).toUpperCase();
  const userId = user?.id;
  const displayedUnreadCount = userId ? unreadCount : 0;

  useEffect(() => {
    if (!userId) return;

    const activeUserId = userId;
    const supabase = createClient();
    let mounted = true;

    async function fetchUnreadCount() {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .is("read_at", null)
        .neq("sender_id", activeUserId);

      if (mounted) setUnreadCount(count ?? 0);
    }

    void fetchUnreadCount();

    const channel = supabase
      .channel(`header-unread:${activeUserId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          void fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block">{SITE_NAME}</span>
          </Link>

          {/* Desktop search bar — form submission navigates to /search?q= */}
          <form action="/search" className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                name="q"
                placeholder="Rechercher une annonce..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {/* Categories dropdown */}
            <div className="relative">
              <button
                onClick={() => { setCategoryOpen(!categoryOpen); setUserMenuOpen(false); }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Catégories <ChevronDown className="h-4 w-4" />
              </button>
              {categoryOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 z-50">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      onClick={() => setCategoryOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span>{cat.labelFr}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Messages */}
            <Link
              href="/messages"
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Messages"
            >
              <MessageCircle className="h-5 w-5" />
              <UnreadBadge
                count={displayedUnreadCount}
                className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]"
              />
            </Link>

            {/* Favorites */}
            <Link
              href="/favorites"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Mes favoris"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Auth state */}
            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => { setUserMenuOpen(!userMenuOpen); setCategoryOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm">
                        {initials}
                      </div>
                      <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                        {displayName}
                      </span>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 z-50">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="h-4 w-4" /> Mon profil
                        </Link>
                        {profile?.is_admin && (
                          <Link
                            href="/admin/pending"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50"
                          >
                            🛡️ Administration
                          </Link>
                        )}
                        <hr className="my-1 border-gray-100" />
                        <form action={signOut}>
                          <button
                            type="submit"
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" /> Déconnexion
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <User className="h-4 w-4" />
                      Connexion
                    </Button>
                  </Link>
                )}
              </>
            )}

            <Link href="/create">
              <Button size="md" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Déposer
              </Button>
            </Link>
          </div>

          {/* Mobile: hamburger + post button */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/create">
              <Button size="sm" className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Déposer
              </Button>
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-gray-600 rounded-lg hover:bg-gray-50"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          {/* Mobile search */}
          <form action="/search" className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                name="q"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-sky-500 focus:outline-none bg-gray-50"
              />
            </div>
          </form>

          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50"
            >
              <span>{cat.icon}</span>
              <span>{cat.labelFr}</span>
              <span className="ml-auto text-xs text-gray-400">{cat.count}</span>
            </Link>
          ))}

          <div className="pt-2 border-t border-gray-100 space-y-1">
            <Link
              href="/messages"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50"
            >
              <MessageCircle className="h-4 w-4" /> Messages
              <UnreadBadge count={displayedUnreadCount} className="ml-auto" />
            </Link>
            <Link
              href="/favorites"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50"
            >
              <Heart className="h-4 w-4" /> Mes favoris
            </Link>

            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" /> Mon profil
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Déconnexion
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50"
              >
                <User className="h-4 w-4" /> Connexion / Inscription
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
