"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { actionError } from "@/lib/i18n/action-errors";
import { notifyVerificationResult } from "@/lib/notifications";

export type VerificationResult = { error: string } | { success: true };

/**
 * Authenticated user requests identity verification for their own profile.
 * Sets verification_status = 'pending'.
 * Cannot be used to set status to 'verified' — only admins can do that.
 */
export async function requestVerification(): Promise<VerificationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: await actionError("errors.authRequired") };

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("profiles")
    .update({
      verification_status: "pending",
      verification_note: null,
      verification_requested_at: now,
      updated_at: now,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[requestVerification]", error.message);
    return { error: await actionError("errors.updateRetry") };
  }

  revalidatePath("/profile");
  return { success: true };
}

/**
 * Admin approves a user's verification request.
 * Sets verification_status = 'verified', identity_verified_at = now().
 * Requires caller to be an admin.
 */
export async function approveVerification(
  targetUserId: string
): Promise<VerificationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: await actionError("errors.authRequired") };

  // Prevent self-verification
  if (user.id === targetUserId) {
    return { error: await actionError("errors.verificationSelf") };
  }

  // Check caller is admin
  const { data: caller } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!caller?.is_admin) {
    return { error: await actionError("errors.adminRequired") };
  }

  // Use service role to bypass RLS for cross-user update
  const { error } = await adminSupabase
    .from("profiles")
    .update({
      verification_status: "verified",
      identity_verified_at: new Date().toISOString(),
      verification_note: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetUserId);

  if (error) {
    console.error("[approveVerification]", error.message);
    return { error: await actionError("errors.updateRetry") };
  }

  await notifyVerificationResult(targetUserId, true);
  revalidatePath("/admin/verifications");
  return { success: true };
}

/**
 * Admin rejects a user's verification request.
 * Sets verification_status = 'rejected', stores optional note.
 * Requires caller to be an admin.
 */
export async function rejectVerification(
  targetUserId: string,
  note: string
): Promise<VerificationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: await actionError("errors.authRequired") };

  if (user.id === targetUserId) {
    return { error: await actionError("errors.verificationSelf") };
  }

  const { data: caller } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!caller?.is_admin) {
    return { error: await actionError("errors.adminRequired") };
  }

  const { error } = await adminSupabase
    .from("profiles")
    .update({
      verification_status: "rejected",
      verification_note: note.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetUserId);

  if (error) {
    console.error("[rejectVerification]", error.message);
    return { error: await actionError("errors.updateRetry") };
  }

  await notifyVerificationResult(targetUserId, false, note.trim() || undefined);
  revalidatePath("/admin/verifications");
  return { success: true };
}
