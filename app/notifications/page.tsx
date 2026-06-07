import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getNotifications } from "@/app/actions/notifications";
import { getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import NotificationsClient from "@/components/notifications/NotificationsClient";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getServerDictionary();
  const t = (key: Parameters<typeof translate>[1]) =>
    translate(dictionary, key);

  return {
    title: `${t("notifications.title")} – NouMarket`,
    robots: { index: false, follow: false },
  };
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/notifications");

  const result = await getNotifications(50);
  const initialNotifications =
    "error" in result ? [] : result.notifications;

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationsClient initialNotifications={initialNotifications} />
    </div>
  );
}
