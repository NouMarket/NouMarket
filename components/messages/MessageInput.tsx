"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { sendMessage } from "@/app/actions/messages";
import type { MessageRow } from "@/types/database";
import Button from "@/components/ui/Button";

interface MessageInputProps {
  conversationId: string;
  onSent?: (message: MessageRow) => void;
}

export default function MessageInput({
  conversationId,
  onSent,
}: MessageInputProps) {
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = body.trim();
    if (!text || pending) return;

    setPending(true);
    setError(null);

    const result = await sendMessage(conversationId, text);
    setPending(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setBody("");
    onSent?.(result.message);
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-100 bg-white p-3">
      {error && (
        <p className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Ecrire un message..."
          rows={1}
          maxLength={2000}
          className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <Button
          type="submit"
          size="md"
          loading={pending}
          disabled={!body.trim()}
          aria-label="Envoyer"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
