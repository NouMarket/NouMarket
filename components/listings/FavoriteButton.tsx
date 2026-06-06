"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { addFavorite, removeFavorite } from "@/app/actions/favorites";
import { useAuth } from "@/components/providers/AuthProvider";

interface FavoriteButtonProps {
  listingId: string;
  listingPath: string;
  initialFavorited?: boolean;
  className?: string;
}

export default function FavoriteButton({
  listingId,
  listingPath,
  initialFavorited = false,
  className,
}: FavoriteButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(listingPath)}`);
      return;
    }

    if (busy) return;

    setBusy(true);
    const next = !favorited;
    setFavorited(next); // optimistic update

    const result = next
      ? await addFavorite(listingId)
      : await removeFavorite(listingId);

    if ("error" in result) setFavorited(!next); // revert on failure
    setBusy(false);
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={cn(
        "p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          favorited ? "fill-red-500 text-red-500" : "text-gray-500",
          busy && "opacity-50"
        )}
      />
    </button>
  );
}
