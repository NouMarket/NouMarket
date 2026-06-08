"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actionError } from "@/lib/i18n/action-errors";
import { checkRateLimit } from "@/lib/rate-limit";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://noumarket.nc";

export async function signIn(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string) || "/";

  if (!email || !password) return actionError("errors.fillAll");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return actionError("errors.invalidCredentials");
    }
    return actionError("errors.genericRetry");
  }

  redirect(next);
}

export async function signUp(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const confirm = (formData.get("confirm") as string | null) ?? "";

  if (!name || !email || !password || !confirm) {
    return actionError("errors.fillAll");
  }
  if (password.length < 8) return actionError("errors.passwordMin");
  if (password !== confirm) return actionError("errors.passwordMismatch");

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
      // Email confirmation disabled: Supabase surfaces the duplicate directly.
      return actionError("auth.emailAlreadyUsed");
    }
    return actionError("errors.createAccount");
  }

  // Email confirmation enabled: Supabase returns a fake-success (error=null,
  // session=null) with an empty identities array for duplicate emails to
  // avoid timing-based enumeration. Detect and surface it as a form error.
  if (!data.user || data.user.identities?.length === 0) {
    return actionError("auth.emailAlreadyUsed");
  }

  if (!data.session) {
    redirect("/register?confirm=1");
  }

  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  if (!email) return actionError("errors.enterEmail");

  const rl = await checkRateLimit(`passwordReset:${email.toLowerCase()}`, 3, 3600);
  if (!rl.ok) return actionError("errors.tooManyAttemptsHour");

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    console.error("[requestPasswordReset]", error.message);
    return actionError("errors.sendReset");
  }

  redirect("/forgot-password?sent=1");
}

export async function updatePassword(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const password = (formData.get("password") as string | null) ?? "";
  const confirm = (formData.get("confirm") as string | null) ?? "";

  if (!password || !confirm) return actionError("errors.fillAll");
  if (password.length < 8) return actionError("errors.passwordMin");
  if (password !== confirm) return actionError("errors.passwordMismatch");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("[updatePassword]", error.message);
    if (error.message.toLowerCase().includes("expired")) {
      return actionError("errors.linkExpired");
    }
    return actionError("errors.updatePassword");
  }

  await supabase.auth.signOut();
  redirect("/login?reset=1");
}
