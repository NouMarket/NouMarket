"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ALL_LOCATIONS } from "@/data/locations";
import { updateProfile } from "@/app/actions/profile";
import type { ProfileRow } from "@/types/database";
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
  const [name, setName] = useState(profile.name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [locationId, setLocationId] = useState(profile.location_id ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url ?? null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setError("Format non supporté. Utilisez JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("Image trop lourde (max 3 Mo).");
      return;
    }

    setAvatarLoading(true);
    setError(null);

    const supabase = createClient();
    // Store under {userId}/avatar/profile (no extension) — upsert handles updates cleanly.
    // Path satisfies Storage RLS: (storage.foldername(name))[1] = auth.uid()::text
    const path = `${profile.id}/avatar/profile`;

    const { data, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });

    if (uploadError) {
      setError(`Échec du téléversement : ${uploadError.message}`);
      setAvatarLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
    // Append cache-bust so the browser fetches the new image immediately
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
      });
      if ("error" in result) {
        setError(result.error);
        setSubmitting(false);
      }
      // On success updateProfile calls redirect() — caught below
    } catch {
      router.refresh();
    }
  }

  const initials = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
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

          {/* Upload trigger */}
          <label
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            title="Changer la photo"
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
          <p className="text-sm font-medium text-gray-700">Photo de profil</p>
          <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP – max 3 Mo</p>
        </div>
      </div>

      {/* Name */}
      <Input
        label="Nom affiché"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Votre nom"
        maxLength={100}
        required
        hint={`${name.length}/100 caractères`}
      />

      {/* Bio */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Parlez un peu de vous…"
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none transition-colors"
        />
        <p className="text-xs text-gray-400">{bio.length}/500 caractères</p>
      </div>

      {/* Location */}
      <Select
        label="Localité"
        options={ALL_LOCATIONS.map((l) => ({
          value: l.id,
          label: l.isNeighborhood ? `${l.name} (${l.commune})` : l.name,
        }))}
        value={locationId}
        onChange={(e) => setLocationId(e.target.value)}
        placeholder="Sélectionnez une localité"
      />

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
          Annuler
        </Button>
        <Button type="submit" loading={submitting} disabled={avatarLoading}>
          {submitting ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
