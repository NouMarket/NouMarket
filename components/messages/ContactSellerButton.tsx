"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { findOrCreateConversation } from "@/app/actions/messages";
import { useAuth } from "@/components/providers/AuthProvider";
import Button from "@/components/ui/Button";

interface ContactSellerButtonProps {
  listingId: string;
  sellerId: string;
  currentPath: string;
}

export default function ContactSellerButton({
  listingId,
  sellerId,
  currentPath,
}: ContactSellerButtonProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && user?.id === sellerId) return null;

  async function handleClick() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(currentPath)}`);
      return;
    }

    setPending(true);
    setError(null);

    const result = await findOrCreateConversation(listingId);
    setPending(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    router.push(`/messages/${result.conversationId}`);
  }

  return (
    <div className="space-y-2">
      <Button
        fullWidth
        size="lg"
        className="gap-2"
        loading={pending}
        onClick={handleClick}
      >
        <MessageCircle className="h-4 w-4" />
        Contacter le vendeur
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
