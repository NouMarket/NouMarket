"use client";

import { useEffect } from "react";
import { trackView } from "@/app/actions/listings";

interface Props {
  listingId: string;
}

export default function ViewTracker({ listingId }: Props) {
  useEffect(() => {
    const key = `nv_${listingId}`;
    if (sessionStorage.getItem(key)) return;

    trackView(listingId).then(() => {
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        // sessionStorage unavailable (e.g. private mode with strict settings)
      }
    });
  }, [listingId]);

  return null;
}
