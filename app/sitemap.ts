import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/data/categories";
import { SITE_URL } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;

  // Static pages
  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  // Category pages
  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${base}/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Active listing pages
  let listingEntries: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("listings")
      .select("slug, updated_at")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(50000);

    if (data) {
      listingEntries = data.map((row) => ({
        url: `${base}/listings/${row.slug}`,
        lastModified: new Date(row.updated_at),
        changeFrequency: "weekly",
        priority: 0.6,
      }));
    }
  } catch {
    // Supabase unavailable — sitemap will only include static pages
  }

  return [...staticEntries, ...categoryEntries, ...listingEntries];
}
