import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import type { ListingReportRow, ListingRow, ProfileRow } from "@/types/database";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Administration - Signalements",
};

const REASON_LABELS: Record<ListingReportRow["reason"], string> = {
  inappropriate: "Contenu inapproprie",
  spam: "Spam",
  fraud: "Fraude ou arnaque",
  wrong_category: "Mauvaise categorie",
  other: "Autre",
};

function byId<T extends { id: string }>(rows: T[] | null | undefined) {
  return new Map((rows ?? []).map((row) => [row.id, row]));
}

export default async function AdminReportsPage() {
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
      <div className="bg-gray-900 px-4 py-3 text-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Flag className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium">Signalements NouMarket</span>
          <Link
            href="/admin/pending"
            className="ml-auto text-xs text-gray-300 hover:text-white"
          >
            Annonces en attente
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Signalements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Consultez les annonces signalees par les utilisateurs.
          </p>
        </div>

        {reportRows.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Aucun signalement
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Les futurs signalements apparaitront ici.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {reportRows.map((report) => {
              const listing = listingMap.get(report.listing_id);
              const reporter = reporterMap.get(report.reporter_id);

              return (
                <div key={report.id} className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="danger">{REASON_LABELS[report.reason]}</Badge>
                        <Badge>{listing?.status ?? "statut inconnu"}</Badge>
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
                          listing?.title ?? "Annonce indisponible"
                        )}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Signale par {reporter?.name ?? "Utilisateur inconnu"}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-gray-400">
                      {new Intl.DateTimeFormat("fr-FR", {
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
