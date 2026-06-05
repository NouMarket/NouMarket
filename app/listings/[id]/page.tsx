import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Eye,
  ChevronRight,
  MessageCircle,
  Heart,
  Share2,
  Tag,
  Star,
} from "lucide-react";
import { getListingById, MOCK_LISTINGS } from "@/data/listings";
import { getCategoryBySlug } from "@/data/categories";
import {
  formatPrice,
  formatDate,
  trustLevelLabel,
  trustLevelColor,
  conditionLabel,
} from "@/lib/utils";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ListingGrid from "@/components/listings/ListingGrid";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return MOCK_LISTINGS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = getListingById(id);
  if (!listing) return {};
  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = getListingById(id);
  if (!listing) notFound();

  const category = getCategoryBySlug(listing.categorySlug);
  const trustColor = trustLevelColor(listing.seller.trustLevel);
  const trustLabel = trustLevelLabel(listing.seller.trustLevel);

  // Related listings (same category, different id)
  const related = MOCK_LISTINGS.filter(
    (l) => l.categorySlug === listing.categorySlug && l.id !== listing.id
  ).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-gray-700">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        {category && (
          <>
            <Link href={`/categories/${category.slug}`} className="hover:text-gray-700">
              {category.labelFr}
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
            <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Attributes */}
          {listing.attributes && Object.keys(listing.attributes).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Caractéristiques</h2>
              <dl className="grid grid-cols-2 gap-3">
                {Object.entries(listing.attributes).map(([key, val]) => (
                  <div key={key} className="bg-gray-50 rounded-xl px-4 py-3">
                    <dt className="text-xs text-gray-500 capitalize">{key}</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-0.5">{val}</dd>
                  </div>
                ))}
                {listing.condition && (
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <dt className="text-xs text-gray-500">État</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-0.5">
                      {conditionLabel(listing.condition)}
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
                  <p className="text-xs text-gray-500 mt-0.5">Prix négociable</p>
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
                  {listing.views} vues
                </div>
              )}
              {category && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  {category.icon} {category.labelFr}
                </div>
              )}
            </div>

            <Button fullWidth size="lg" className="gap-2 mb-2">
              <MessageCircle className="h-4 w-4" />
              Contacter le vendeur
            </Button>
            <Button fullWidth variant="outline" size="md">
              Faire une offre
            </Button>
          </div>

          {/* Seller card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">À propos du vendeur</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm flex-shrink-0">
                {listing.seller.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{listing.seller.name}</p>
                <Badge className={trustColor}>{trustLabel}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-bold text-gray-900">{listing.seller.listingCount}</p>
                <p className="text-xs text-gray-500 mt-0.5">annonces</p>
              </div>
              {listing.seller.responseRate && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="font-bold text-gray-900">{listing.seller.responseRate}%</p>
                  <p className="text-xs text-gray-500 mt-0.5">réponses</p>
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              Membre depuis {listing.seller.memberSince}
            </div>
          </div>

          {/* Safety tips */}
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 text-xs text-amber-800 space-y-1">
            <p className="font-semibold mb-2">Conseils de sécurité</p>
            <p>• Rencontrez l&apos;acheteur dans un lieu public</p>
            <p>• Ne payez pas à l&apos;avance sans voir le bien</p>
            <p>• Utilisez la messagerie NouMarket</p>
          </div>
        </div>
      </div>

      {/* Related listings */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Annonces similaires</h2>
          <ListingGrid listings={related} compact />
        </div>
      )}
    </div>
  );
}
