"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
 */
export async function signUp(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const name     = (formData.get("name")     as string | null)?.trim() ?? "";
  const email    = (formData.get("email")    as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const confirm  = (formData.get("confirm")  as string | null) ?? "";

  // Server-side validation — never trust client-only checks
  if (!name || !email || !password || !confirm)
    return "Veuillez remplir tous les champs.";
  if (password.length < 8)
    return "Le mot de passe doit faire au moins 8 caractères.";
  if (password !== confirm)
    return "Les mots de passe ne correspondent pas.";

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
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

  // Redirect to home; Supabase may require email confirmation depending on project settings
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
