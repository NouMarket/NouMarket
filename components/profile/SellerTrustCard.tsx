import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Phone,
  Package,
  ShoppingBag,
  Star,
  CheckCircle,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { trustLevelColor } from "@/lib/utils";
import { getServerDictionary } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import type { SellerTrustLevel } from "@/types";
import Badge from "@/components/ui/Badge";

interface Props {
  userId: string;
  /** If true, show avatar + name header (default: true). Set false when parent already renders a name. */
  showHeader?: boolean;
}

export default async function SellerTrustCard({
  userId,
  showHeader = true,
}: Props) {
  const [dictionary, supabase] = await Promise.all([
    getServerDictionary(),
    createClient(),
  ]);
  const t = (key: TranslationKey, params?: Record<string, string | number>) =>
    translate(dictionary, key, params);

  const [profileRes, statsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "name, avatar_url, trust_level, member_since, response_rate, phone_verified_at, identity_verified_at, verification_status"
      )
      .eq("id", userId)
      .single(),
    supabase
      .from("listings")
      .select("status")
      .eq("seller_id", userId)
      .in("status", ["active", "sold"]),
  ]);

  const profile = profileRes.data;
  if (!profile) return null;

  const rows = statsRes.data ?? [];
  const activeCount = rows.filter((r) => r.status === "active").length;
  const soldCount = rows.filter((r) => r.status === "sold").length;

  const trustLevel = (profile.trust_level ?? "new") as SellerTrustLevel;
  const tColor = trustLevelColor(trustLevel);
  const tLabel = t(`trust.${trustLevel}` as TranslationKey);

  const memberSince = new Date(profile.member_since).toLocaleDateString(
    "fr-FR",
    { year: "numeric", month: "long" }
  );

  const phoneVerified = !!profile.phone_verified_at;
  const identityVerified =
    profile.verification_status === "verified" &&
    !!profile.identity_verified_at;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      {showHeader && (
        <div className="flex items-center gap-3">
          <Link href={`/sellers/${userId}`} className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm overflow-hidden">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
          </Link>
          <div>
            <Link
              href={`/sellers/${userId}`}
              className="text-sm font-medium text-gray-900 hover:text-sky-600 transition-colors"
            >
              {profile.name}
            </Link>
            <div className="mt-0.5">
              <Badge className={tColor}>{tLabel}</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Trust signals */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          {t("common.memberSince", { date: memberSince })}
        </div>

        {profile.response_rate != null && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
            {t("profile.responses", { count: profile.response_rate })}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs">
          {identityVerified ? (
            <>
              <CheckCircle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span className="text-blue-700 font-medium">
                {t("verification.identityVerified")}
              </span>
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              <span className="text-gray-400">
                {t("verification.identityComingSoon")}
              </span>
            </>
          )}
        </div>

        {phoneVerified && (
          <div className="flex items-center gap-2 text-xs">
            <Phone className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="text-green-700 font-medium">
              {t("verification.phoneVerified")}
            </span>
          </div>
        )}

        {!phoneVerified && (
          <div className="flex items-center gap-2 text-xs">
            <Phone className="h-3.5 w-3.5 text-gray-300 shrink-0" />
            <span className="text-gray-400">
              {t("verification.phoneNotVerified")}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
          <Package className="h-4 w-4 text-sky-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-gray-900">{activeCount}</p>
            <p className="text-xs text-gray-500">{t("seller.activeListings")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
          <ShoppingBag className="h-4 w-4 text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-gray-900">{soldCount}</p>
            <p className="text-xs text-gray-500">{t("seller.completedSales")}</p>
          </div>
        </div>
      </div>

      <Link
        href={`/sellers/${userId}`}
        className="block text-center text-xs text-sky-600 hover:text-sky-700 font-medium"
      >
        {t("common.viewAll")} →
      </Link>
    </div>
  );
}
