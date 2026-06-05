import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type {
  ConversationRow,
  ListingRow,
  MessageRow,
  ProfileRow,
} from "@/types/database";
import MessageList from "@/components/messages/MessageList";

interface Props {
  params: Promise<{ conversationId: string }>;
}

export const metadata: Metadata = {
  title: "Conversation",
};

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/messages/${conversationId}`);
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (conversationError || !conversation) notFound();

  const thread = conversation as ConversationRow;
  if (thread.buyer_id !== user.id && thread.seller_id !== user.id) notFound();

  const otherId = thread.buyer_id === user.id ? thread.seller_id : thread.buyer_id;

  const [{ data: listing }, { data: other }, { data: messages }] =
    await Promise.all([
      supabase
        .from("listings")
        .select("id, slug, title")
        .eq("id", thread.listing_id)
        .maybeSingle(),
      supabase.from("profiles").select("*").eq("id", otherId).maybeSingle(),
      supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }),
    ]);

  const listingRow = listing as Pick<ListingRow, "id" | "slug" | "title"> | null;
  const otherProfile = other as ProfileRow | null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center gap-3">
          <Link
            href="/messages"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50"
            aria-label="Retour aux messages"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-gray-900">
              {listingRow?.title ?? "Annonce indisponible"}
            </h1>
            <p className="text-sm text-gray-500">
              Conversation avec {otherProfile?.name ?? "Utilisateur"}
            </p>
          </div>
        </div>

        <MessageList
          conversationId={conversationId}
          currentUserId={user.id}
          initialMessages={(messages ?? []) as MessageRow[]}
        />
      </div>
    </div>
  );
}
