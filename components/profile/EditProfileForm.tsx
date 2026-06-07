"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, CheckCircle, Clock, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ALL_LOCATIONS } from "@/data/locations";
import { updateProfile } from "@/app/actions/profile";
import type { ProfileRow } from "@/types/database";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

interface Props {
  profile: ProfileRow;
}

const STORAGE_BUCKET = "listing-images";
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function EditProfileForm({ profile }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setName] = useState(profile.name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [locationId, setLocationId] = useState(profile.location_id ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile.avatar_url ?? null
  );
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setError(t("create.unsupportedFormat", { name: file.name }));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError(`${file.name} : max 3 MB`);
      return;
    }

    setAvatarLoading(true);
    setError(null);

    const supabase = createClient();
    const path = `${profile.id}/avatar/profile`;

    const { data, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      setError(
        t("create.uploadFailed", {
          name: file.name,
          message: uploadError.message,
        })
      );
      setAvatarLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);
    setAvatarUrl(`${urlData.publicUrl}?t=${Date.now()}`);
    setAvatarLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await updateProfile({
        name,
        bio,
        locationId,
        avatarUrl: avatarUrl ?? null,
        phone,
      });
      if ("error" in result) {
        setError(result.error);
        setSubmitting(false);
      }
    } catch {
      router.refresh();
    }
  }

  const initials = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 flex-shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name || "Avatar"}
              fill
              className="rounded-2xl object-cover"
              sizes="80px"
              unoptimized
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-2xl">
              {initials}
            </div>
          )}

          <label
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            title={t("profile.changePhoto")}
          >
            <Camera className="h-3.5 w-3.5 text-gray-600" />
            <input
              type="file"
              accept={ALLOWED_AVATAR_TYPES.join(",")}
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </label>

          {avatarLoading && (
            <div className="absolute inset-0 rounded-2xl bg-white/70 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700">{t("profile.avatar")}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {t("profile.avatarRules")}
          </p>
        </div>
      </div>

      <Input
        label={t("profile.displayName")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("profile.namePlaceholder")}
        maxLength={100}
        required
        hint={t("profile.characters", { count: name.length, max: 100 })}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={t("profile.bioPlaceholder")}
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none transition-colors"
        />
        <p className="text-xs text-gray-400">
          {t("profile.characters", { count: bio.length, max: 500 })}
        </p>
      </div>

      <Select
        label={t("create.locationLabel")}
        options={ALL_LOCATIONS.map((location) => ({
          value: location.id,
          label: location.isNeighborhood
            ? `${location.name} (${location.commune})`
            : location.name,
        }))}
        value={locationId}
        onChange={(e) => setLocationId(e.target.value)}
        placeholder={t("profile.locationPlaceholder")}
      />

      <Input
        label={t("profile.phone")}
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={t("profile.phonePlaceholder")}
        hint={t("profile.phoneNote")}
      />

      {/* Verification status (read-only display) */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <p className="text-sm font-medium text-gray-700 mb-2">
          {t("profile.verificationStatus")}
        </p>
        <div className="flex items-center gap-2 text-sm">
          {profile.verification_status === "verified" ? (
            <>
              <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-blue-700 font-medium">
                {t("verification.verified")}
              </span>
            </>
          ) : profile.verification_status === "pending" ? (
            <>
              <Clock className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="text-amber-700">{t("verification.pending")}</span>
            </>
          ) : profile.verification_status === "rejected" ? (
            <>
              <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
              <span className="text-red-700">
                {t("verification.rejected")}
                {profile.verification_note && (
                  <span className="ml-1 font-normal text-red-600">
                    — {profile.verification_note}
                  </span>
                )}
              </span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-500">{t("verification.none")}</span>
            </>
          )}
        </div>
        {profile.phone_verified_at && (
          <p className="mt-1.5 text-xs text-green-700 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {t("verification.phoneVerified")}
          </p>
        )}
        {!profile.phone_verified_at && (
          <p className="mt-1.5 text-xs text-gray-400">
            {t("verification.comingSoon")}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/profile")}
          disabled={submitting || avatarLoading}
        >
          {t("common.cancel")}
        </Button>
        <Button type="submit" loading={submitting} disabled={avatarLoading}>
          {submitting ? t("profile.saving") : t("common.save")}
        </Button>
      </div>
    </form>
  );
}
