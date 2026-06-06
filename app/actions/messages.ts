"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ConversationRow, ListingRow, MessageRow } from "@/types/database";

type ActionResult<T> = T | { error: string };

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

async function getVisibleConversation(
  conversationId: string,
  userId: string
): Promise<ActionResult<{ conversation: ConversationRow }>> {
  const { supabase } = await getCurrentUser();
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (error || !data) return { error: "Conversation introuvable." };
  if (data.buyer_id !== userId && data.seller_id !== userId) {
    return { error: "Acces refuse." };
  }

  return { conversation: data };
}

export async function findOrCreateConversation(
  listingId: string
): Promise<ActionResult<{ conversationId: string }>> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Vous devez etre connecte pour envoyer un message." };

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) return { error: "Annonce introuvable." };
  if ((listing as Pick<ListingRow, "seller_id">).seller_id === user.id) {
    return { error: "Vous ne pouvez pas vous envoyer un message." };
  }

  const sellerId = (listing as Pick<ListingRow, "seller_id">).seller_id;

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (existing?.id) return { conversationId: existing.id };

  const { data: created, error: insertError } = await supabase
    .from("conversations")
    .insert({
      listing_id: listingId,
      buyer_id: user.id,
      seller_id: sellerId,
      deleted_by_buyer: false,
      deleted_by_seller: false,
    })
    .select("id")
    .single();

  if (!insertError && created?.id) {
    revalidatePath("/messages");
    return { conversationId: created.id };
  }

  if (insertError?.code === "23505") {
    const { data: restored, error: restoreError } = await supabase
      .from("conversations")
      .update({ deleted_by_buyer: false })
      .eq("listing_id", listingId)
      .eq("buyer_id", user.id)
      .select("id")
      .single();

    if (!restoreError && restored?.id) {
      revalidatePath("/messages");
      return { conversationId: restored.id };
    }
  }

  return { error: "Impossible de creer la conversation. Reessayez." };
}

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<ActionResult<{ message: MessageRow }>> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Vous devez etre connecte pour envoyer un message." };

  const text = body.trim();
  if (!text) return { error: "Le message est vide." };
  if (text.length > 2000) return { error: "Le message est trop long." };

  const rl = await checkRateLimit(`sendMessage:${user.id}`, 20, 60);
  if (!rl.ok) return { error: rl.error };

  const visible = await getVisibleConversation(conversationId, user.id);
  if ("error" in visible) return visible;

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: text,
    })
    .select("*")
    .single();

  if (error || !message) return { error: "Message non envoye. Reessayez." };

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  return { message };
}

export async function markMessagesRead(
  conversationId: string
): Promise<ActionResult<{ success: true }>> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Vous devez etre connecte." };

  const visible = await getVisibleConversation(conversationId, user.id);
  if ("error" in visible) return visible;

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);

  if (error) return { error: "Lecture des messages impossible." };

  revalidatePath("/messages");
  return { success: true };
}

export async function deleteConversation(
  conversationId: string
): Promise<ActionResult<{ success: true }>> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Vous devez etre connecte." };

  const visible = await getVisibleConversation(conversationId, user.id);
  if ("error" in visible) return visible;

  const update =
    visible.conversation.buyer_id === user.id
      ? { deleted_by_buyer: true }
      : { deleted_by_seller: true };

  const { error } = await supabase
    .from("conversations")
    .update(update)
    .eq("id", conversationId);

  if (error) return { error: "Suppression impossible. Reessayez." };

  revalidatePath("/messages");
  return { success: true };
}
