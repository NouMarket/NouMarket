"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle,
  XCircle,
  MessageCircle,
  Heart,
  Flag,
  CheckCheck,
} from "lucide-react";
import type { NotificationRow } from "@/types/database";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/actions/notifications";

// ─── Helpers (duplicated from NotificationDropdown intentionally) ─────────────

type TFn = (key: TranslationKey, params?: Record<string, string | number>) => string;

function relativeTime(dateStr: string, t: TFn): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return t("time.now");
  if (diff < 3600) return t("time.minutesAgo", { count: Math.floor(diff / 60) });
  if (diff < 86400) return t("time.hoursAgo", { count: Math.floor(diff / 3600) });
  return t("time.daysAgo", { count: Math.floor(diff / 86400) });
}

function getNotifContent(
  n: NotificationRow,
  t: TFn
): { title: string; body: string; icon: React.ReactNode } {
  const meta = (n.metadata ?? {}) as Record<string, string>;
  const listingTitle = meta.listingTitle ?? n.title;
  const senderName = meta.senderName ?? t("common.unknownUser");

  switch (n.type) {
    case "listing_approved":
      return {
        title: t("notif.listing_approved.title"),
        body: t("notif.listing_approved.body", { title: listingTitle }),
        icon: <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />,
      };
    case "listing_rejected":
      return {
        title: t("notif.listing_rejected.title"),
        body: t("notif.listing_rejected.body", { title: listingTitle }),
        icon: <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
      };
    case "new_message":
      return {
        title: t("notif.new_message.title"),
        body: t("notif.new_message.body", { name: senderName }),
        icon: <MessageCircle className="h-5 w-5 text-sky-500 shrink-0" />,
      };
    case "listing_favorited":
      return {
        title: t("notif.listing_favorited.title"),
        body: t("notif.listing_favorited.body", { title: listingTitle }),
        icon: <Heart className="h-5 w-5 text-rose-500 shrink-0" />,
      };
    case "listing_reported":
      return {
        title: t("notif.listing_reported.title"),
        body: t("notif.listing_reported.body", { title: listingTitle }),
        icon: <Flag className="h-5 w-5 text-amber-500 shrink-0" />,
      };
    default:
      return {
        title: n.title,
        body: n.body,
        icon: <Bell className="h-5 w-5 text-gray-400 shrink-0" />,
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  initialNotifications: NotificationRow[];
}

export default function NotificationsClient({ initialNotifications }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  function handleMarkAllRead() {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
    );
    void markAllNotificationsRead();
  }

  function handleItemClick(n: NotificationRow) {
    if (!n.read_at) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, read_at: new Date().toISOString() } : item
        )
      );
      void markNotificationRead(n.id);
    }
    if (n.href) router.push(n.href);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:px-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("notifications.title")}</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            {t("notifications.markAllRead")}
          </button>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Bell className="h-12 w-12 text-gray-200 mb-4" />
          <p className="text-base font-medium text-gray-500">{t("notifications.empty")}</p>
          <p className="text-sm text-gray-400 mt-1">{t("notifications.emptyText")}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const { title, body, icon } = getNotifContent(n, t);
            const isUnread = !n.read_at;

            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleItemClick(n)}
                  className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                    isUnread
                      ? "bg-sky-50 border-sky-100 hover:bg-sky-100/60"
                      : "bg-white border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="mt-0.5">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">{title}</p>
                      {isUnread && (
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-sky-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5 leading-snug">{body}</p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {relativeTime(n.created_at, t)}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
