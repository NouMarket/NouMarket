import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Package,
  Clock,
  ShoppingBag,
  MessageSquare,
  Flag,
  ShieldCheck,
  MessagesSquare,
  Eye,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { CATEGORIES, getCategoryBySlug } from "@/data/categories";
import { getCategoryCounts } from "@/lib/categories";
import { trustLevelColor } from "@/lib/utils";
import { getLocale, getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import type { SellerTrustLevel } from "@/types";
import AdminNav from "@/components/admin/AdminNav";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Tableau de bord — Admin",
  robots: { index: false, follow: false },
};

// ─── Stat card helper ─────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  href,
}: {
  label: string;
  value: number | null;
  icon: React.ElementType;
  iconBg: string;
  href?: string;
}) {
  const inner = (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:border-gray-200 transition-colors">
      <div className={`${iconBg} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 tabular-nums">
          {value?.toLocaleString("fr-FR") ?? "—"}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  // Auth guard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!callerProfile?.is_admin) notFound();

  const [dictionary, locale] = await Promise.all([
    getServerDictionary(),
    getLocale(),
  ]);
  const t = (key: TranslationKey, params?: Record<string, string | number>) =>
    translate(dictionary, key, params);

  const dateFmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "tr" ? "tr-TR" : "fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // ── Batch 1: aggregate counts (8 parallel HEAD queries) ───────────────────
  const [
    { count: totalUsers },
    { count: activeListings },
    { count: pendingListings },
    { count: soldListings },
    { count: totalMessages },
    { count: totalConversations },
    { count: totalReports },
    { count: pendingVerifications },
  ] = await Promise.all([
    adminSupabase
      .from("profiles")
      .select("*", { count: "exact", head: true }),
    adminSupabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    adminSupabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    adminSupabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "sold"),
    adminSupabase
      .from("messages")
      .select("*", { count: "exact", head: true }),
    adminSupabase
      .from("conversations")
      .select("*", { count: "exact", head: true }),
    adminSupabase
      .from("listing_reports")
      .select("*", { count: "exact", head: true }),
    adminSupabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "pending"),
  ]);

  // ── Batch 2: content rows (6 parallel queries) ────────────────────────────
  const [
    categoryCounts,
    { data: recentListingsRaw },
    { data: recentUsersRaw },
    { data: recentReportsRaw },
    { data: topListingsRaw },
  ] = await Promise.all([
    getCategoryCounts(),
    adminSupabase
      .from("listings")
      .select("id, slug, title, status, created_at, category_slug")
      .order("created_at", { ascending: false })
      .limit(10),
    adminSupabase
      .from("profiles")
      .select("id, name, avatar_url, member_since, trust_level")
      .order("member_since", { ascending: false })
      .limit(10),
    adminSupabase
      .from("listing_reports")
      .select("id, reason, created_at, listing_id")
      .order("created_at", { ascending: false })
      .limit(10),
    adminSupabase
      .from("listings")
      .select("id, slug, title, category_slug, views, status")
      .order("views", { ascending: false })
      .limit(10),
  ]);

  // Resolve listing titles for recent reports (one extra query, at most 10 IDs)
  const reportListingIds = [
    ...new Set((recentReportsRaw ?? []).map((r) => r.listing_id)),
  ];
  const { data: reportListingsRaw } = reportListingIds.length
    ? await adminSupabase
        .from("listings")
        .select("id, slug, title")
        .in("id", reportListingIds)
    : { data: [] as { id: string; slug: string; title: string }[] };
  const reportListingMap = new Map(
    (reportListingsRaw ?? []).map((l) => [l.id, l])
  );

  // Top 5 categories by active count
  const topCategories = CATEGORIES.map((cat) => ({
    ...cat,
    activeCount: categoryCounts[cat.slug] ?? 0,
  }))
    .sort((a, b) => b.activeCount - a.activeCount)
    .slice(0, 5);
  const maxCount = topCategories[0]?.activeCount || 1;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav current="/admin" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("admin.dashboardTitle")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("admin.dashboardSubtitle")}
          </p>
        </div>

        {/* ── Stats grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label={t("admin.statUsers")}
            value={totalUsers}
            icon={Users}
            iconBg="bg-sky-50 text-sky-600"
          />
          <StatCard
            label={t("admin.statActive")}
            value={activeListings}
            icon={Package}
            iconBg="bg-green-50 text-green-600"
            href="/search"
          />
          <StatCard
            label={t("admin.statPending")}
            value={pendingListings}
            icon={Clock}
            iconBg="bg-amber-50 text-amber-600"
            href="/admin/pending"
          />
          <StatCard
            label={t("admin.statSold")}
            value={soldListings}
            icon={ShoppingBag}
            iconBg="bg-violet-50 text-violet-600"
          />
          <StatCard
            label={t("admin.statMessages")}
            value={totalMessages}
            icon={MessageSquare}
            iconBg="bg-blue-50 text-blue-600"
          />
          <StatCard
            label={t("admin.statConversations")}
            value={totalConversations}
            icon={MessagesSquare}
            iconBg="bg-teal-50 text-teal-600"
          />
          <StatCard
            label={t("admin.statReports")}
            value={totalReports}
            icon={Flag}
            iconBg="bg-red-50 text-red-600"
            href="/admin/reports"
          />
          <StatCard
            label={t("admin.statVerifications")}
            value={pendingVerifications}
            icon={ShieldCheck}
            iconBg="bg-indigo-50 text-indigo-600"
            href="/admin/verifications"
          />
        </div>

        {/* ── Row 2: Recent listings + Recent users ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent listings */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                {t("admin.recentListings")}
              </h2>
              <Link
                href="/admin/pending"
                className="text-xs text-sky-600 hover:text-sky-700"
              >
                {t("common.viewAll")} →
              </Link>
            </div>
            {(recentListingsRaw ?? []).length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">
                {t("admin.noData")}
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {(recentListingsRaw ?? []).map((listing) => {
                  const cat = getCategoryBySlug(listing.category_slug);
                  const statusKey =
                    `status.${listing.status}` as TranslationKey;
                  return (
                    <li key={listing.id} className="px-5 py-3 flex items-center gap-3">
                      <span className="text-lg shrink-0">{cat?.icon ?? "📋"}</span>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/listings/${listing.slug}`}
                          className="text-sm font-medium text-gray-900 hover:text-sky-600 truncate block"
                        >
                          {listing.title}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {dateFmt(listing.created_at)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          listing.status === "active"
                            ? "success"
                            : listing.status === "pending"
                            ? "warning"
                            : listing.status === "rejected"
                            ? "danger"
                            : listing.status === "sold"
                            ? "purple"
                            : "default"
                        }
                      >
                        {t(statusKey)}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Recent users */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                {t("admin.recentUsers")}
              </h2>
            </div>
            {(recentUsersRaw ?? []).length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">
                {t("admin.noData")}
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {(recentUsersRaw ?? []).map((profile) => {
                  const trustLevel =
                    (profile.trust_level as SellerTrustLevel) ?? "new";
                  const tColor = trustLevelColor(trustLevel);
                  const tLabel = t(
                    `trust.${trustLevel}` as TranslationKey
                  );
                  return (
                    <li key={profile.id} className="px-5 py-3 flex items-center gap-3">
                      <Link
                        href={`/sellers/${profile.id}`}
                        className="shrink-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-xs overflow-hidden">
                          {profile.avatar_url ? (
                            <Image
                              src={profile.avatar_url}
                              alt={profile.name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            profile.name.charAt(0).toUpperCase()
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/sellers/${profile.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-sky-600 truncate block"
                        >
                          {profile.name}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {dateFmt(profile.member_since)}
                        </p>
                      </div>
                      <Badge className={tColor}>{tLabel}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* ── Row 3: Recent reports + Top categories ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent reports */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                {t("admin.recentReports")}
              </h2>
              <Link
                href="/admin/reports"
                className="text-xs text-sky-600 hover:text-sky-700"
              >
                {t("common.viewAll")} →
              </Link>
            </div>
            {(recentReportsRaw ?? []).length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">
                {t("admin.noData")}
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {(recentReportsRaw ?? []).map((report) => {
                  const listing = reportListingMap.get(report.listing_id);
                  const reasonKey =
                    `listing.reportReason.${report.reason}` as TranslationKey;
                  return (
                    <li key={report.id} className="px-5 py-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="danger">{t(reasonKey)}</Badge>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 truncate">
                          {listing ? (
                            <Link
                              href={`/listings/${listing.slug}`}
                              className="hover:text-sky-600"
                            >
                              {listing.title}
                            </Link>
                          ) : (
                            <span className="text-gray-400">
                              {t("common.unavailableListing")}
                            </span>
                          )}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-gray-400">
                        {dateFmt(report.created_at)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Top categories */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                {t("admin.topCategories")}
              </h2>
            </div>
            <ul className="px-5 py-4 space-y-3">
              {topCategories.map((cat) => (
                <li key={cat.slug}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      {t(`category.${cat.slug}` as TranslationKey)}
                    </span>
                    <span className="text-xs font-medium text-gray-500 tabular-nums">
                      {cat.activeCount.toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 rounded-full transition-all"
                      style={{
                        width: `${Math.round(
                          (cat.activeCount / maxCount) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
              {topCategories.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  {t("admin.noData")}
                </p>
              )}
            </ul>
          </section>
        </div>

        {/* ── Row 4: Top listings by views ───────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-sky-500" />
            <h2 className="text-sm font-semibold text-gray-900">
              {t("admin.topListings")}
            </h2>
          </div>
          {(topListingsRaw ?? []).length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">
              {t("admin.noData")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 w-full">
                      {t("create.titleLabel")}
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">
                      {t("common.categories")}
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap text-right">
                      <Eye className="h-3.5 w-3.5 inline-block mr-1" />
                      {t("common.views")}
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">
                      {t("common.status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(topListingsRaw ?? []).map((listing) => {
                    const cat = getCategoryBySlug(listing.category_slug);
                    const statusKey =
                      `status.${listing.status}` as TranslationKey;
                    return (
                      <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 max-w-0">
                          <Link
                            href={`/listings/${listing.slug}`}
                            className="font-medium text-gray-900 hover:text-sky-600 truncate block"
                          >
                            {listing.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          <span className="flex items-center gap-1">
                            {cat?.icon ?? "📋"}
                            {t(`category.${listing.category_slug}` as TranslationKey)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900 tabular-nums">
                          {(listing.views ?? 0).toLocaleString("fr-FR")}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge
                            variant={
                              listing.status === "active"
                                ? "success"
                                : listing.status === "pending"
                                ? "warning"
                                : listing.status === "rejected"
                                ? "danger"
                                : listing.status === "sold"
                                ? "purple"
                                : "default"
                            }
                          >
                            {t(statusKey)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
