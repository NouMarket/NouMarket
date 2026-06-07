import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
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
import ConversationCard from "@/components/messages/ConversationCard";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

function byId<T extends { id: string }>(rows: T[] | null | undefined) {
  return new Map((rows ?? []).map((row) => [row.id, row]));
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/messages");

  const dictionary = await getServerDictionary();
  const t = (key: TranslationKey, params?: Record<string, string | number>) =>
    translate(dictionary, key, params);

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .or(
      `and(buyer_id.eq.${user.id},deleted_by_buyer.eq.false),and(seller_id.eq.${user.id},deleted_by_seller.eq.false)`
    )
    .order("created_at", { ascending: false });

  const visibleConversations = (conversations ?? []) as ConversationRow[];
  const conversationIds = visibleConversations.map((item) => item.id);
  const listingIds = [...new Set(visibleConversations.map((item) => item.listing_id))];
  const participantIds = [
    ...new Set(visibleConversations.flatMap((item) => [item.buyer_id, item.seller_id])),
  ];

  const [{ data: listings }, { data: profiles }, { data: messages }] =
    await Promise.all([
      listingIds.length
        ? supabase.from("listings").select("id, slug, title").in("id", listingIds)
        : Promise.resolve({ data: [] }),
      participantIds.length
        ? supabase.from("profiles").select("*").in("id", participantIds)
        : Promise.resolve({ data: [] }),
      conversationIds.length
        ? supabase
            .from("messages")
            .select("*")
            .in("conversation_id", conversationIds)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [] }),
    ]);

  const listingMap = byId((listings ?? []) as Pick<ListingRow, "id" | "slug" | "title">[]);
  const profileMap = byId((profiles ?? []) as ProfileRow[]);
  const messagesByConversation = new Map<string, MessageRow[]>();

  for (const message of (messages ?? []) as MessageRow[]) {
    const thread = messagesByConversation.get(message.conversation_id) ?? [];
    thread.push(message);
    messagesByConversation.set(message.conversation_id, thread);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t("messages.title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("messages.subtitle")}</p>
        </div>

        {visibleConversations.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <div className="text-4xl mb-4">💬</div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t("messages.emptyTitle")}
            </h2>
            <p className="mt-2 text-sm text-gray-500 mb-6">
              {t("messages.emptyText")}
            </p>
            <Link href="/search">
              <Button>{t("common.search")}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleConversations.map((conversation) => {
              const listing = listingMap.get(conversation.listing_id);
              const otherId =
                conversation.buyer_id === user.id
                  ? conversation.seller_id
                  : conversation.buyer_id;
              const other = profileMap.get(otherId);
              const thread = messagesByConversation.get(conversation.id) ?? [];
              const last = thread.at(-1);
              const unreadCount = thread.filter(
                (message) => message.sender_id !== user.id && !message.read_at
              ).length;

              return (
                <ConversationCard
                  key={conversation.id}
                  conversationId={conversation.id}
                  listingTitle={listing?.title ?? t("common.unavailableListing")}
                  otherParticipantName={other?.name ?? t("common.user")}
                  lastMessage={last?.body}
                  lastMessageAt={last?.created_at}
                  unreadCount={unreadCount}
                  emptyLastMessage={t("messages.lastEmpty")}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
