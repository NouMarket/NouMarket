"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/actions/notifications";
import type { NotificationRow } from "@/types/database";
import UnreadBadge from "@/components/messages/UnreadBadge";
import NotificationDropdown from "./NotificationDropdown";

interface Props {
  /** Called when the dropdown opens, so parent can close other dropdowns */
  onOpen?: () => void;
}

export default function NotificationBell({ onOpen }: Props) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const userId = user?.id;
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  // ── Fetch + realtime subscription ─────────────────────────────────────────

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    let mounted = true;

    async function fetchNotifications() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(10);

      if (mounted) setNotifications((data ?? []) as NotificationRow[]);
    }

    void fetchNotifications();

    // Re-fetch on any notification change for THIS user only.
    // filter: limits WAL events server-side so other users' notifications never
    // reach this client. The re-fetch itself is also user-scoped (RLS + explicit
    // .eq("user_id")). Realtime being unavailable is handled gracefully — the
    // initial fetchNotifications() above always runs via REST independently.
    const channel = supabase
      .channel(`notif-bell:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => { void fetchNotifications(); }
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  // ── Click-outside handler ─────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function toggleOpen() {
    if (!open) onOpen?.();
    setOpen((prev) => !prev);
  }

  function handleMarkAllRead() {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
    );
    void markAllNotificationsRead();
  }

  function handleMarkRead(id: string) {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
    void markNotificationRead(id);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  // Don't render for unauthenticated users
  if (!userId) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggleOpen}
        aria-label={t("nav.notifications")}
        aria-expanded={open}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        <UnreadBadge
          count={unreadCount}
          className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]"
        />
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          onMarkRead={handleMarkRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
