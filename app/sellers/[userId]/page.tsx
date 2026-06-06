import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Star, Package, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapJoinedListingToListing, type JoinedListing } from "@/lib/mappers";
import { buildPersonSchema } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/constants";
import { trustLevelLabel, trustLevelColor } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import ListingGrid from "@/components/listings/ListingGrid";

interface Props {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .single();

  if (!profile) return {};

  return {
    title: `${profile.name} – Vendeur sur NouMarket`,
    description: `Découvrez les annonces de ${profile.name} sur NouMarket, la marketplace de Nouvelle-Calédonie.`,
    openGraph: {
      title: `${profile.name} – NouMarket`,
      description: `Annonces de ${profile.name} en Nouvelle-Calédonie.`,
    },
  };
}

export default async function SellerPage({ params }: Props) {
  const { userId } = await params;
  const supabase = await createClient();

  // All three queries in parallel — profiles are publicly readable (RLS: using(true))
  // Select only the fields shown in the UI; never fetch is_admin or updated_at
  const [
    { data: profileData },
    { data: activeListingData },
    { count: soldCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, avatar_url, trust_level, location_name, bio, response_rate, member_since")
      .eq("id", userId)
      .single(),
    supabase
      .from("listings")
      .select("*, listing_images(url, order), profiles!seller_id(*)")
      .eq("seller_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", userId)
      .eq("status", "sold"),
  ]);

  if (!profileData) notFound();

  const profile = profileData;
  const activeListings = activeListingData
    ? (activeListingData as JoinedListing[]).map(mapJoinedListingToListing)
    : [];

  const displayName = profile.name;
  const memberSince = new Date(profile.member_since).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
  });
  const tColor = trustLevelColor(profile.trust_level ?? "new");
  const tLabel = trustLevelLabel(profile.trust_level ?? "new");
  const jsonLd = JSON.stringify(buildPersonSchema(displayName, userId, SITE_URL));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* JSON-LD: Person */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-2xl shrink-0 overflow-hidden">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={displayName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
              <Badge className={tColor}>✓ {tLabel}</Badge>
            </div>
            {profile.bio && (
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">{profile.bio}</p>
            )}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              {profile.location_name && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {profile.location_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Membre depuis {memberSince}
              </span>
              {profile.response_rate != null && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {profile.response_rate}% de réponses
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <Package className="h-5 w-5 text-sky-500 shrink-0" />
            <div>
              <p className="text-xl font-bold text-gray-900">{activeListings.length}</p>
              <p className="text-xs text-gray-500">annonces actives</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <ShoppingBag className="h-5 w-5 text-green-500 shrink-0" />
            <div>
              <p className="text-xl font-bold text-gray-900">{soldCount ?? 0}</p>
              <p className="text-xs text-gray-500">ventes réalisées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active listings */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          Annonces de {displayName}
          {activeListings.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({activeListings.length})
            </span>
          )}
        </h2>
      </div>

      {activeListings.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">Aucune annonce active pour le moment.</p>
          <Link href="/search" className="mt-3 inline-block text-sky-500 hover:text-sky-600 text-sm font-medium">
            Parcourir toutes les annonces →
          </Link>
        </div>
      ) : (
        <ListingGrid listings={activeListings} />
      )}
    </div>
  );
}
