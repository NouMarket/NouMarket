"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, ChevronUp, ChevronDown, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FREE_IMAGE_LIMIT } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n/useTranslation";

const MAX_FILES = FREE_IMAGE_LIMIT;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BUCKET = "listing-images";

interface UploadedImage {
  url: string;
  name: string;
}

interface ImageUploaderProps {
  userId: string;
  listingId: string;
  onChange: (urls: string[]) => void;
  initialUrls?: string[];
}

export default function ImageUploader({
  userId,
  listingId,
  onChange,
  initialUrls,
}: ImageUploaderProps) {
  const { t } = useTranslation();
  const [images, setImages] = useState<UploadedImage[]>(
    (initialUrls ?? []).map((url) => ({
      url,
      name: url.split("/").pop() ?? "image",
    }))
  );
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const supabase = createClient();

  function updateImages(next: UploadedImage[]) {
    setImages(next);
    onChange(next.map((img) => img.url));
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    const newErrors: string[] = [];

    const valid = fileArray.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        newErrors.push(t("create.unsupportedFormat", { name: file.name }));
        return false;
      }
      if (file.size > MAX_BYTES) {
        newErrors.push(t("create.fileTooLarge", { name: file.name }));
        return false;
      }
      return true;
    });

    if (images.length + valid.length > MAX_FILES) {
      newErrors.push(t("create.maxPhotosReached", { max: MAX_FILES }));
      valid.splice(MAX_FILES - images.length);
    }

    setErrors(newErrors);
    if (valid.length === 0) return;

    setUploading(true);
    const uploaded: UploadedImage[] = [];

    for (const file of valid) {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${userId}/${listingId}/${timestamp}-${safeName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) {
        newErrors.push(
          t("create.uploadFailed", { name: file.name, message: error.message })
        );
        continue;
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path);

      uploaded.push({ url: urlData.publicUrl, name: file.name });
    }

    setErrors(newErrors);
    setUploading(false);
    updateImages([...images, ...uploaded]);
  }

  function remove(index: number) {
    updateImages(images.filter((_, i) => i !== index));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...images];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    updateImages(next);
  }

  function moveDown(index: number) {
    if (index === images.length - 1) return;
    const next = [...images];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    updateImages(next);
  }

  const canAddMore = images.length < MAX_FILES && !uploading;

  return (
    <div className="space-y-4">
      {canAddMore && (
        <label
          className="block border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/40 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          <input
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
              <p className="text-sm text-gray-500">{t("create.uploading")}</p>
            </div>
          ) : (
            <>
              <Upload className="h-7 w-7 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">
                {t("create.dropPhotos")}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t("create.photoRules", {
                  current: images.length,
                  max: MAX_FILES,
                  plural: images.length !== 1 ? "s" : "",
                })}
              </p>
            </>
          )}
        </label>
      )}

      {errors.length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-3 space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img, index) => (
            <div
              key={img.url}
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group"
            >
              <Image
                src={img.url}
                alt={img.name}
                fill
                className="object-cover"
                sizes="120px"
              />

              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                  {t("create.coverPhoto")}
                </span>
              )}

              <div className="absolute inset-0 bg-black/25 sm:bg-black/0 sm:group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 sm:opacity-0 sm:group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-1 bg-white/90 rounded-lg disabled:opacity-30"
                  aria-label={t("create.moveUp")}
                >
                  <ChevronUp className="h-3.5 w-3.5 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === images.length - 1}
                  className="p-1 bg-white/90 rounded-lg disabled:opacity-30"
                  aria-label={t("create.moveDown")}
                >
                  <ChevronDown className="h-3.5 w-3.5 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1 bg-white/90 rounded-lg"
                  aria-label={t("common.delete")}
                >
                  <X className="h-3.5 w-3.5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length >= MAX_FILES && (
        <p className="text-xs text-amber-600">
          {t("create.maxPhotosReached", { max: MAX_FILES })}
        </p>
      )}
    </div>
  );
}
