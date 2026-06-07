import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getRelativeTime } from "@/lib/utils";
import UnreadBadge from "./UnreadBadge";

interface ConversationCardProps {
  conversationId: string;
  listingTitle: string;
  otherParticipantName: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  emptyLastMessage: string;
}

export default function ConversationCard({
  conversationId,
  listingTitle,
  otherParticipantName,
  lastMessage,
  lastMessageAt,
  unreadCount,
  emptyLastMessage,
}: ConversationCardProps) {
  return (
    <Link
      href={`/messages/${conversationId}`}
      className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
        <MessageCircle className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-sm font-semibold text-gray-900">
            {listingTitle}
          </h2>
          <UnreadBadge count={unreadCount} className="shrink-0" />
        </div>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          {otherParticipantName}
        </p>
        <p className="mt-1 truncate text-sm text-gray-600">
          {lastMessage ?? emptyLastMessage}
        </p>
      </div>
      {lastMessageAt && (
        <span className="hidden shrink-0 text-xs text-gray-400 sm:block">
          {getRelativeTime(lastMessageAt)}
        </span>
      )}
    </Link>
  );
}
