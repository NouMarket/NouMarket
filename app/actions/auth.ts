"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://noumarket.nc";

/**
 * Sign in with email + password.
 * On success redirects to the `next` param (or "/" as fallback).
 * On failure returns an error string to display in the form.
 */
export async function signIn(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string) || "/";

  if (!email || !password) return "Veuillez remplir tous les champs.";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return "E-mail ou mot de passe incorrect.";
    }
    return "Une erreur est survenue. Réessayez.";
  }

  redirect(next);
}

/**
 * Register a new account.
 * Passes `name` in user_metadata so the DB trigger populates profiles.name.
 * If Supabase requires email confirmation, redirects to /register?confirm=1
 * instead of the home page so the user knows to check their inbox.
 */
export async function signUp(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const name     = (formData.get("name")     as string | null)?.trim() ?? "";
  const email    = (formData.get("email")    as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const confirm  = (formData.get("confirm")  as string | null) ?? "";

  if (!name || !email || !password || !confirm)
    return "Veuillez remplir tous les champs.";
  if (password.length < 8)
    return "Le mot de passe doit faire au moins 8 caractères.";
  if (password !== confirm)
    return "Les mots de passe ne correspondent pas.";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return "Cette adresse e-mail est déjà utilisée.";
    }
    return "Impossible de créer le compte. Réessayez.";
  }

  // session is null when Supabase requires email confirmation
  if (!data.session) {
    redirect("/register?confirm=1");
  }

  redirect("/");
}

/**
 * Sign out the current user and redirect to /login.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Send a password-reset email.
 * Uses the Supabase PKCE flow: the email link hits /auth/callback which
 * exchanges the code for a recovery session, then redirects to /reset-password.
 * Always redirects to /forgot-password?sent=1 on success (avoids email enumeration).
 */
export async function requestPasswordReset(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  if (!email) return "Veuillez entrer votre adresse e-mail.";

  // Key on email so the limit applies even for unauthenticated callers
  const rl = await checkRateLimit(`passwordReset:${email.toLowerCase()}`, 3, 3600);
  if (!rl.ok) return "Trop de tentatives. Réessayez dans une heure.";

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    console.error("[requestPasswordReset]", error.message);
    return "Impossible d'envoyer le lien. Réessayez.";
  }

  redirect("/forgot-password?sent=1");
}

/**
 * Set a new password for the currently authenticated user.
 * Called from /reset-password after the user has exchanged the recovery code
 * via /auth/callback.  Signs the user out after update so they must log in
 * with their new password.
 */
export async function updatePassword(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const password = (formData.get("password") as string | null) ?? "";
  const confirm  = (formData.get("confirm")  as string | null) ?? "";

  if (!password || !confirm) return "Veuillez remplir tous les champs.";
  if (password.length < 8) return "Le mot de passe doit faire au moins 8 caractères.";
  if (password !== confirm) return "Les mots de passe ne correspondent pas.";

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("[updatePassword]", error.message);
    if (error.message.toLowerCase().includes("expired")) {
      return "Le lien a expiré. Demandez-en un nouveau.";
    }
    return "Impossible de mettre à jour le mot de passe. Réessayez.";
  }

  await supabase.auth.signOut();
  redirect("/login?reset=1");
}
