"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle,
  XCircle,
  MessageCircle,
  Heart,
  Flag,
  CheckCheck,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import type { NotificationRow } from "@/types/database";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import { useTranslation } from "@/lib/i18n/useTranslation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
        icon: <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />,
      };
    case "listing_rejected":
      return {
        title: t("notif.listing_rejected.title"),
        body: t("notif.listing_rejected.body", { title: listingTitle }),
        icon: <XCircle className="h-4 w-4 text-red-500 shrink-0" />,
      };
    case "new_message":
      return {
        title: t("notif.new_message.title"),
        body: t("notif.new_message.body", { name: senderName }),
        icon: <MessageCircle className="h-4 w-4 text-sky-500 shrink-0" />,
      };
    case "listing_favorited":
      return {
        title: t("notif.listing_favorited.title"),
        body: t("notif.listing_favorited.body", { title: listingTitle }),
        icon: <Heart className="h-4 w-4 text-rose-500 shrink-0" />,
      };
    case "listing_reported":
      return {
        title: t("notif.listing_reported.title"),
        body: t("notif.listing_reported.body", { title: listingTitle }),
        icon: <Flag className="h-4 w-4 text-amber-500 shrink-0" />,
      };
    case "verification_approved":
      return {
        title: t("notif.verification_approved.title"),
        body: t("notif.verification_approved.body"),
        icon: <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />,
      };
    case "verification_rejected": {
      const rejectionNote = meta.rejectionNote;
      const baseBody = t("notif.verification_rejected.body");
      const body = rejectionNote
        ? `${baseBody} ${t("notif.verification_rejected.note", { note: rejectionNote })}`
        : baseBody;
      return {
        title: t("notif.verification_rejected.title"),
        body,
        icon: <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />,
      };
    }
    default:
      return {
        title: n.title || t("notif.unknown.title"),
        body: n.body || "",
        icon: <Bell className="h-4 w-4 text-gray-400 shrink-0" />,
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  notifications: NotificationRow[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

export default function NotificationDropdown({
  notifications,
  onMarkAllRead,
  onMarkRead,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const visible = notifications.slice(0, 10);

  function handleItemClick(n: NotificationRow) {
    if (!n.read_at) onMarkRead(n.id);
    onClose();
    if (n.href) router.push(n.href);
  }

  return (
    <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="font-semibold text-sm text-gray-900">
          {t("notifications.title")}
        </span>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {t("notifications.markAllRead")}
          </button>
        )}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <Bell className="h-8 w-8 text-gray-200 mb-2" />
          <p className="text-sm font-medium text-gray-500">{t("notifications.empty")}</p>
          <p className="text-xs text-gray-400 mt-0.5">{t("notifications.emptyText")}</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50 max-h-[360px] overflow-y-auto">
          {visible.map((n) => {
            const { title, body, icon } = getNotifContent(n, t);
            const isUnread = !n.read_at;

            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleItemClick(n)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                    isUnread ? "bg-sky-50/40" : ""
                  }`}
                >
                  <div className="mt-0.5">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{title}</p>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-snug">
                      {body}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {relativeTime(n.created_at, t)}
                    </p>
                  </div>
                  {isUnread && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-sky-500 shrink-0" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Footer */}
      {visible.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-2">
          <Link
            href="/notifications"
            onClick={onClose}
            className="block text-center text-xs text-sky-600 hover:text-sky-700 font-medium py-1 transition-colors"
          >
            {t("notifications.viewAll")}
          </Link>
        </div>
      )}
    </div>
  );
}
