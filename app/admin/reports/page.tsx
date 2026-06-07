import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import type { ListingReportRow, ListingRow, ProfileRow } from "@/types/database";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import { getLocale, getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import AdminNav from "@/components/admin/AdminNav";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Administration - Signalements",
  robots: { index: false, follow: false },
};

function byId<T extends { id: string }>(rows: T[] | null | undefined) {
  return new Map((rows ?? []).map((row) => [row.id, row]));
}

export default async function AdminReportsPage() {
  const [dictionary, locale] = await Promise.all([
    getServerDictionary(),
    getLocale(),
  ]);
  const t = (key: TranslationKey, params?: Record<string, string | number>) =>
    translate(dictionary, key, params);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin/reports");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) notFound();

  const { data: reports } = await adminSupabase
    .from("listing_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const reportRows = (reports ?? []) as ListingReportRow[];
  const listingIds = [...new Set(reportRows.map((report) => report.listing_id))];
  const reporterIds = [...new Set(reportRows.map((report) => report.reporter_id))];

  const [{ data: listings }, { data: reporters }] = await Promise.all([
    listingIds.length
      ? adminSupabase
          .from("listings")
          .select("id, slug, title, status")
          .in("id", listingIds)
      : Promise.resolve({ data: [] }),
    reporterIds.length
      ? adminSupabase.from("profiles").select("*").in("id", reporterIds)
      : Promise.resolve({ data: [] }),
  ]);

  const listingMap = byId(
    (listings ?? []) as Pick<ListingRow, "id" | "slug" | "title" | "status">[]
  );
  const reporterMap = byId((reporters ?? []) as ProfileRow[]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav current="/admin/reports" />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("admin.reportsTitle")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("admin.reportsSubtitle")}
          </p>
        </div>

        {reportRows.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("admin.reportsEmptyTitle")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {t("admin.reportsEmptyText")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {reportRows.map((report) => {
              const listing = listingMap.get(report.listing_id);
              const reporter = reporterMap.get(report.reporter_id);
              const statusKey = listing?.status
                ? (`status.${listing.status}` as TranslationKey)
                : undefined;

              return (
                <div key={report.id} className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="danger">
                          {t(`listing.reportReason.${report.reason}` as TranslationKey)}
                        </Badge>
                        <Badge>
                          {statusKey ? t(statusKey) : t("common.unavailableListing")}
                        </Badge>
                      </div>
                      <h2 className="truncate font-semibold text-gray-900">
                        {listing?.slug ? (
                          <Link
                            href={`/listings/${listing.slug}`}
                            className="hover:text-sky-600"
                          >
                            {listing.title}
                          </Link>
                        ) : (
                          listing?.title ?? t("common.unavailableListing")
                        )}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {t("admin.reportedBy", {
                          name: reporter?.name ?? t("common.unknownUser"),
                        })}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-gray-400">
                      {new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(report.created_at))}
                    </p>
                  </div>

                  {report.details && (
                    <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                      {report.details}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
