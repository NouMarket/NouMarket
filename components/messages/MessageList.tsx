"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { markMessagesRead } from "@/app/actions/messages";
import type { MessageRow } from "@/types/database";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

interface MessageListProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: MessageRow[];
}

export default function MessageList({
  conversationId,
  currentUserId,
  initialMessages,
}: MessageListProps) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  useEffect(() => {
    void markMessagesRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const next = payload.new as MessageRow;
          setMessages((prev) =>
            prev.some((message) => message.id === next.id)
              ? prev
              : [...prev, next]
          );

          if (next.sender_id !== currentUserId) {
            void markMessagesRead(conversationId);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, supabase]);

  function appendSent(message: MessageRow) {
    setMessages((prev) =>
      prev.some((item) => item.id === message.id) ? prev : [...prev, message]
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
      <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-64 items-center justify-center text-center text-sm text-gray-400">
            Aucun message pour le moment.
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserId={currentUserId}
            />
          ))
        )}
        <div ref={endRef} />
      </div>
      <MessageInput conversationId={conversationId} onSent={appendSent} />
    </div>
  );
}
