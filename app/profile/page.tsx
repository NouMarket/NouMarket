import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Settings, Star, Package, MapPin, Calendar, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapJoinedListingToListing, type JoinedListing } from "@/lib/mappers";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProfileListingCard from "@/components/profile/ProfileListingCard";
import { trustLevelLabel, trustLevelColor } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mon profil",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ updated?: string }>;
}

export default async function ProfilePage({ searchParams }: Props) {
  const { updated } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profile");

  // Fetch real profile row (proxy.ts already ensures user is logged in,
  // but this gives us the full profile data)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: listingData, error: listingsError } = await supabase
    .from("listings")
    .select("*, listing_images(url, order), profiles!seller_id(*)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const myListings =
    !listingsError && listingData
      ? (listingData as JoinedListing[]).map(mapJoinedListingToListing)
      : [];

  const displayName = profile?.name ?? user.email?.split("@")[0] ?? "Utilisateur";
  const memberSince = profile?.member_since
    ? new Date(profile.member_since).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
      })
    : "–";

  const tColor = trustLevelColor(profile?.trust_level ?? "new");
  const tLabel = trustLevelLabel(profile?.trust_level ?? "new");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile updated success banner */}
      {updated === "1" && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3 text-green-700">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">Profil mis à jour avec succès.</p>
        </div>
      )}

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-2xl flex-shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
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
            <p className="text-sm text-gray-500 mb-1">{user.email}</p>
            {profile?.bio && (
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">{profile.bio}</p>
            )}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              {profile?.location_name && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {profile.location_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Membre depuis {memberSince}
              </span>
              {profile?.response_rate && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {profile.response_rate}% de réponses
                </span>
              )}
            </div>
          </div>

          <Link href="/profile/edit">
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              <Settings className="h-4 w-4" />
              Modifier
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          {[
            { label: "Annonces", value: myListings.length, icon: Package },
            { label: "Ventes", value: "–", icon: Star },
            { label: "Avis", value: "–", icon: Star },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* My listings */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          Mes annonces ({myListings.length})
        </h2>
        <Link href="/create">
          <Button size="sm">+ Nouvelle annonce</Button>
        </Link>
      </div>

      {myListings.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">
            Vous n&apos;avez pas encore d&apos;annonces.{" "}
            <Link href="/create" className="text-sky-500 hover:text-sky-600 font-medium">
              Déposez votre première annonce !
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {myListings.map((listing) => (
            <ProfileListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
