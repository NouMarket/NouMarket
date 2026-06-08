"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
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
    // Log error details server-side for diagnostics — never log password
    console.error("[signUp] auth error:", {
      code: error.code,
      message: error.message,
      status: error.status,
    });
    if (error.message.includes("already registered")) {
      // Email confirmation disabled: Supabase surfaces the duplicate directly.
      return actionError("auth.emailAlreadyUsed");
    }
    if (
      error.code === "over_email_send_rate_limit" ||
      error.status === 429 ||
      error.message.toLowerCase().includes("email rate limit")
    ) {
      return actionError("auth.emailRateLimit");
    }
    // Database/trigger errors surface with these message patterns.
    // Common cause: deleted user re-registers and auth.identities residue or
    // the handle_new_user trigger fails on the profiles INSERT.
    if (
      error.message.toLowerCase().includes("database") ||
      error.message.toLowerCase().includes("trigger") ||
      error.message.toLowerCase().includes("profiles")
    ) {
      return actionError("auth.profileCreateFailed");
    }
    return actionError("auth.signupFailed");
  }

  // Email confirmation enabled: Supabase returns a fake-success (error=null,
  // session=null) with an empty identities array for duplicate emails to
  // avoid timing-based enumeration. Detect and surface it as a form error.
  if (!data.user || data.user.identities?.length === 0) {
    return actionError("auth.emailAlreadyUsed");
  }

  // Post-signup: verify handle_new_user trigger created the profiles row.
  // The trigger has no exception handler — any failure rolls back auth.users
  // too — but this check guards against unforeseen race conditions.
  const { data: profileCheck } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .single();

  if (!profileCheck) {
    // Trigger didn't fire or lost a race — attempt manual fallback creation
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .insert({ id: data.user.id, name });

    if (profileError) {
      console.error("[signUp] profile fallback creation failed:", {
        code: profileError.code,
        message: profileError.message,
      });
      return actionError("auth.profileCreateFailed");
    }
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
