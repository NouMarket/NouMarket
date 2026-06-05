import type { MessageRow } from "@/types/database";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: MessageRow;
  currentUserId: string;
}

export default function MessageBubble({
  message,
  currentUserId,
}: MessageBubbleProps) {
  const mine = message.sender_id === currentUserId;
  const sentAt = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(message.created_at));

  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
          mine
            ? "rounded-br-md bg-sky-500 text-white"
            : "rounded-bl-md bg-white text-gray-800 border border-gray-100"
        )}
      >
        <p className="whitespace-pre-line leading-relaxed">{message.body}</p>
        <p className={cn("mt-1 text-[11px]", mine ? "text-sky-100" : "text-gray-400")}>
          {sentAt}
        </p>
      </div>
    </div>
  );
}
