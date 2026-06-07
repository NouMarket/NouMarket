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
import { getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import MessageList from "@/components/messages/MessageList";

interface Props {
  params: Promise<{ conversationId: string }>;
}

const PRIVATE: Metadata["robots"] = { index: false, follow: false };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { title: "Conversation", robots: PRIVATE };

  const { data: conv } = await supabase
    .from("conversations")
    .select("listing_id, buyer_id, seller_id")
    .eq("id", conversationId)
    .single();

  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
    return { title: "Conversation", robots: PRIVATE };
  }

  const otherId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;

  const [{ data: listing }, { data: other }] = await Promise.all([
    supabase.from("listings").select("title").eq("id", conv.listing_id).maybeSingle(),
    supabase.from("profiles").select("name").eq("id", otherId).maybeSingle(),
  ]);

  const title =
    listing?.title && other?.name
      ? `${listing.title} – ${other.name}`
      : listing?.title ?? "Conversation";

  return { title, robots: PRIVATE };
}

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
  const dictionary = await getServerDictionary();
  const t = (key: TranslationKey, params?: Record<string, string | number>) =>
    translate(dictionary, key, params);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center gap-3">
          <Link
            href="/messages"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50"
            aria-label={t("messages.title")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-gray-900">
              {listingRow?.title ?? t("common.unavailableListing")}
            </h1>
            <p className="text-sm text-gray-500">
              {t("messages.with", { name: otherProfile?.name ?? t("common.user") })}
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
