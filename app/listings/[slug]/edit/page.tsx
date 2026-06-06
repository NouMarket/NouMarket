import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapJoinedListingToListing, type JoinedListing } from "@/lib/mappers";
import CreateListingForm, { type EditInitialData } from "@/components/forms/CreateListingForm";

export const metadata: Metadata = {
  title: "Modifier l'annonce",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditListingPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/listings/${slug}/edit`);

  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(url, order), profiles!seller_id(*)")
    .eq("slug", slug)
    .single();

  if (error || !data) notFound();

  const listing = mapJoinedListingToListing(data as JoinedListing);

  // Only the seller can edit
  if (listing.seller.id !== user.id) redirect(`/listings/${slug}`);

  // Archived listings cannot be edited
  if (listing.status === "archived") redirect(`/listings/${slug}`);

  const initialData: EditInitialData = {
    listingId: listing.id,
    categorySlug: listing.categorySlug,
    title: listing.title,
    description: listing.description,
    condition: listing.condition ?? "",
    price: listing.price,
    priceNegotiable: listing.priceNegotiable ?? false,
    locationId: listing.locationId,
    imageUrls: listing.images,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Back link */}
      <Link
        href={`/listings/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour à l&apos;annonce
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Modifier l&apos;annonce</h1>
        <p className="text-sm text-gray-500 mt-1">
          Après modification, votre annonce sera soumise à une nouvelle modération.
        </p>
      </div>

      <CreateListingForm mode="edit" initialData={initialData} />
    </div>
  );
}
