import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Eye,
  ChevronRight,
  Heart,
  Share2,
  Tag,
  CheckCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MOCK_LISTINGS } from "@/data/listings";
import { getCategoryBySlug } from "@/data/categories";
import { mapJoinedListingToListing, type JoinedListing } from "@/lib/mappers";
import { buildListingJsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/constants";
import { getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import {
  formatPrice,
  formatDate,
} from "@/lib/utils";
import type { Listing } from "@/types";
import ListingGrid from "@/components/listings/ListingGrid";
import ContactSellerButton from "@/components/messages/ContactSellerButton";
import ReportListingModal from "@/components/listings/ReportListingModal";
import SellerListingActions from "@/components/listings/SellerListingActions";
import ViewTracker from "@/components/listings/ViewTracker";
import SellerTrustCard from "@/components/profile/SellerTrustCard";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ submitted?: string }>;
}

/** Fetch by slug from Supabase; fall back to mock data if DB is unavailable. */
async function getListing(slug: string): Promise<Listing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(url, order), profiles!seller_id(*)")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    // DB not reachable or listing not found — try mock data
    return MOCK_LISTINGS.find((l) => l.slug === slug) ?? null;
  }

  return mapJoinedListingToListing(data as JoinedListing);
}

/**
 * Fetch related listings — same category, same location preferred.
 * Fetches up to 8, sorts same-location first, returns top 4.
 */
async function getRelated(
  categorySlug: string,
  excludeSlug: string,
  locationId: string
): Promise<Listing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(url, order), profiles!seller_id(*)")
    .eq("status", "active")
    .eq("category_slug", categorySlug)
    .neq("slug", excludeSlug)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error || !data) {
    const fallback = MOCK_LISTINGS.filter(
      (l) => l.categorySlug === categorySlug && l.slug !== excludeSlug
    );
    fallback.sort((a, b) =>
      a.locationId === locationId ? -1 : b.locationId === locationId ? 1 : 0
    );
    return fallback.slice(0, 4);
  }

  const rows = (data as JoinedListing[]).map(mapJoinedListingToListing);
  // Stable sort: same-location rows bubble to front, DB date order preserved within ties
  rows.sort((a, b) => {
    const aLocal = a.locationId === locationId ? 0 : 1;
    const bLocal = b.locationId === locationId ? 0 : 1;
    return aLocal - bLocal;
  });
  return rows.slice(0, 4);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return {};

  const description = listing.description.slice(0, 160);
  const image = listing.images[0] ?? null;

  return {
    title: listing.title,
    description,
    openGraph: {
      title: listing.title,
      description,
      url: `/listings/${slug}`,
      type: "website",
      ...(image && {
        images: [{ url: image, width: 1200, height: 630, alt: listing.title }],
      }),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: listing.title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function ListingDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { submitted } = await searchParams;
  const listing = await getListing(slug);
  if (!listing) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Non-active listings are only visible to the seller or an admin
  if (listing.status !== "active") {
    if (!user) notFound();
    if (user.id !== listing.seller.id) {
      const { data: profCheck } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (!profCheck?.is_admin) notFound();
    }
  }

  const dictionary = await getServerDictionary();
  const t = (key: TranslationKey, params?: Record<string, string | number>) =>
    translate(dictionary, key, params);
  const category = getCategoryBySlug(listing.categorySlug);
  const related = await getRelated(listing.categorySlug, slug, listing.locationId);
  const canReport = user && user.id !== listing.seller.id;
  const isSeller = user?.id === listing.seller.id;
  const jsonLd = buildListingJsonLd(listing, category, SITE_URL);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* JSON-LD: Product + BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      {/* View counter — fire-and-forget, skips self-views */}
      <ViewTracker listingId={listing.id} />

      {/* Status banner — shown to seller when their listing is not yet active */}
      {listing.status !== "active" && user?.id === listing.seller.id && !submitted && (
        <div
          className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${
            listing.status === "pending"
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : listing.status === "rejected"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-gray-50 border-gray-200 text-gray-600"
          }`}
        >
          <p className="font-semibold">
            {listing.status === "pending" && "Votre annonce est en cours de modération."}
            {listing.status === "rejected" && "Votre annonce a été rejetée."}
            {listing.status === "sold" && "Cette annonce est marquée comme vendue."}
            {listing.status === "expired" && "Cette annonce a expiré."}
            {listing.status === "archived" && "Cette annonce est archivée."}
          </p>
          {listing.status === "pending" && (
            <p className="text-xs mt-0.5 opacity-80">
              Elle sera publiée sous 24h après validation par notre équipe. Elle n&apos;est
              visible que par vous pour l&apos;instant.
            </p>
          )}
        </div>
      )}

      {/* Submission success banner */}
      {submitted && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3 text-green-700">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">{t("listing.submittedTitle")}</p>
            <p className="text-xs text-green-600 mt-0.5">
              {t("listing.submittedText")}
            </p>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-gray-700">{t("nav.home")}</Link>
        <ChevronRight className="h-3 w-3" />
        {category && (
          <>
            <Link href={`/categories/${category.slug}`} className="hover:text-gray-700">
              {t(`category.${category.slug}` as TranslationKey)}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: images + description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
            {listing.images[0] ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">📷</div>
            )}
          </div>

          {/* Thumbnail strip */}
          {listing.images.length > 1 && (
            <div className="flex gap-2">
              {listing.images.map((img, i) => (
                <div key={i} className="relative w-20 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="80px" />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-3">{t("listing.description")}</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Attributes */}
          {listing.attributes && Object.keys(listing.attributes).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">{t("listing.attributes")}</h2>
              <dl className="grid grid-cols-2 gap-3">
                {Object.entries(listing.attributes).map(([key, val]) => (
                  <div key={key} className="bg-gray-50 rounded-xl px-4 py-3">
                    <dt className="text-xs text-gray-500 capitalize">{key}</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-0.5">{val}</dd>
                  </div>
                ))}
                {listing.condition && (
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <dt className="text-xs text-gray-500">{t("create.conditionLabel")}</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-0.5">
                      {t(`condition.${listing.condition}` as TranslationKey)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        {/* Right: price card + seller */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(listing.price)}
                </p>
                {listing.priceNegotiable && (
                  <p className="text-xs text-gray-500 mt-0.5">{t("listing.priceNegotiable")}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
                  <Heart className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-5 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                {listing.locationName}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                {formatDate(listing.createdAt)}
              </div>
              {listing.views != null && (
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  {listing.views} {t("common.views")}
                </div>
              )}
              {category && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  {category.icon} {t(`category.${category.slug}` as TranslationKey)}
                </div>
              )}
            </div>

            <ContactSellerButton
              listingId={listing.id}
              sellerId={listing.seller.id}
              currentPath={`/listings/${listing.slug}`}
            />
          </div>

          {/* Seller card */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {t("listing.seller")}
            </h3>
            <SellerTrustCard userId={listing.seller.id} />
          </div>

          {/* Seller management actions */}
          {isSeller && (
            <SellerListingActions
              listingId={listing.id}
              slug={listing.slug}
              status={listing.status}
            />
          )}

          {/* Safety tips */}
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 text-xs text-amber-800 space-y-1">
            <p className="font-semibold mb-2">{t("listing.safetyTitle")}</p>
            <p>• {t("listing.safetyMeet")}</p>
            <p>• {t("listing.safetyAdvance")}</p>
            <p>• {t("listing.safetyMessaging")}</p>
          </div>

          {canReport && (
            <div className="text-center">
              <ReportListingModal
                listingId={listing.id}
                sellerId={listing.seller.id}
                currentPath={`/listings/${listing.slug}`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Related listings */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t("listing.related")}</h2>
          <ListingGrid listings={related} compact />
        </div>
      )}
    </div>
  );
}
