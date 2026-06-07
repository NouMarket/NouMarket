"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { ALL_LOCATIONS } from "@/data/locations";
import { CONDITION_OPTIONS, FREE_IMAGE_LIMIT } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import { createListing, updateListing, type CreateListingPayload, type UpdateListingPayload } from "@/app/actions/listings";
import { useAuth } from "@/components/providers/AuthProvider";
import ImageUploader from "@/components/forms/ImageUploader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const TOTAL_STEPS = 5;

type FormState = {
  categorySlug: string;
  title: string;
  description: string;
  condition: string;
  price: number;
  priceNegotiable: boolean;
  locationId: string;
  imageUrls: string[];
  /** In create mode: client-generated UUID that becomes the listing id.
   *  In edit mode: the existing listing's UUID (used as the Storage folder prefix). */
  pendingListingId: string;
};

export type EditInitialData = {
  listingId: string;
  categorySlug: string;
  title: string;
  description: string;
  condition: string;
  price: number;
  priceNegotiable: boolean;
  locationId: string;
  imageUrls: string[];
};

interface CreateListingFormProps {
  mode?: "create" | "edit";
  initialData?: EditInitialData;
}

function generatePendingId(): string {
  return typeof crypto !== "undefined"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const EMPTY_FORM = (): FormState => ({
  categorySlug: "",
  title: "",
  description: "",
  condition: "",
  price: 0,
  priceNegotiable: false,
  locationId: "",
  imageUrls: [],
  pendingListingId: generatePendingId(),
});

function formFromInitialData(data: EditInitialData): FormState {
  return {
    categorySlug: data.categorySlug,
    title: data.title,
    description: data.description,
    condition: data.condition,
    price: data.price,
    priceNegotiable: data.priceNegotiable,
    locationId: data.locationId,
    imageUrls: data.imageUrls,
    pendingListingId: data.listingId,
  };
}

export default function CreateListingForm({ mode = "create", initialData }: CreateListingFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(
    mode === "edit" && initialData ? formFromInitialData(initialData) : EMPTY_FORM()
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateStep(): boolean {
    const newErrors: typeof errors = {};
    if (step === 1 && !form.categorySlug) newErrors.categorySlug = "Choisissez une catégorie";
    if (step === 2) {
      if (!form.title.trim()) newErrors.title = "Le titre est requis";
      if (form.title.length > 80) newErrors.title = "Maximum 80 caractères";
      if (!form.description.trim()) newErrors.description = "La description est requise";
    }
    if (step === 3) {
      if (form.price < 0) newErrors.price = "Le prix ne peut pas être négatif";
      if (!form.locationId) newErrors.locationId = "Choisissez une localité";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function next() {
    if (validateStep()) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setServerError(null);

    try {
      if (mode === "edit" && initialData) {
        const payload: UpdateListingPayload = {
          listingId: initialData.listingId,
          categorySlug: form.categorySlug,
          title: form.title,
          description: form.description,
          condition: form.condition,
          price: form.price,
          priceNegotiable: form.priceNegotiable,
          locationId: form.locationId,
          imageUrls: form.imageUrls,
        };
        const result = await updateListing(payload);
        if ("error" in result) {
          setServerError(result.error);
          setSubmitting(false);
        }
        // On success, updateListing redirects
      } else {
        const payload: CreateListingPayload = {
          pendingListingId: form.pendingListingId,
          categorySlug: form.categorySlug,
          title: form.title,
          description: form.description,
          condition: form.condition,
          price: form.price,
          priceNegotiable: form.priceNegotiable,
          locationId: form.locationId,
          imageUrls: form.imageUrls,
        };
        const result = await createListing(payload);
        if ("error" in result) {
          setServerError(result.error);
          setSubmitting(false);
        }
        // On success, createListing redirects
      }
    } catch {
      // redirect() throws internally in Next.js — expected, not a real error
      router.refresh();
    }
  }

  const selectedCategory = CATEGORIES.find((c) => c.slug === form.categorySlug);
  const selectedLocation = ALL_LOCATIONS.find((l) => l.id === form.locationId);
  const stepLabels = [
    t("create.category"),
    t("create.details"),
    t("create.priceLocation"),
    t("create.photos"),
    t("create.preview"),
  ];
  const conditionOptions = CONDITION_OPTIONS.map((option) => ({
    value: option.value,
    label: t(`condition.${option.value}` as TranslationKey),
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          {stepLabels.map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <div key={n} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                    ${done ? "bg-green-500 text-white" : active ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-400"}`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : n}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? "text-gray-900" : "text-gray-400"}`}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded ${done ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        {/* Step 1: Category */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t("create.chooseCategory")}</h2>
            <p className="text-sm text-gray-500 mb-6">
              {t("create.chooseCategoryHelp")}
            </p>
            {errors.categorySlug && (
              <p className="text-sm text-red-500 mb-3">{errors.categorySlug}</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => set("categorySlug", cat.slug)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all
                    ${form.categorySlug === cat.slug
                      ? "border-sky-500 bg-sky-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {t(`category.${cat.slug}` as TranslationKey)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{t("create.listingDetails")}</h2>
              <p className="text-sm text-gray-500">
                {t("create.listingDetailsHelp")}
              </p>
            </div>
            <Input
              label={t("create.titleLabel")}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ex : iPhone 15 Pro Max 256 Go – Comme neuf"
              error={errors.title}
              hint={`${form.title.length}/80`}
              maxLength={80}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">{t("create.descriptionLabel")}</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Décrivez l'état, les caractéristiques, les accessoires inclus..."
                rows={5}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none transition-colors ${errors.description ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
            </div>
            {selectedCategory?.slug !== "emploi" && selectedCategory?.slug !== "services" && (
              <Select
                label={t("create.conditionLabel")}
                options={conditionOptions}
                value={form.condition}
                onChange={(e) => set("condition", e.target.value)}
                placeholder={t("create.conditionLabel")}
              />
            )}
          </div>
        )}

        {/* Step 3: Price & location */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{t("create.priceLocation")}</h2>
              <p className="text-sm text-gray-500">
                {t("create.subtitle")}
              </p>
            </div>
            <Input
              label={t("create.priceLabel")}
              type="number"
              min={0}
              value={form.price || ""}
              onChange={(e) => set("price", Number(e.target.value))}
              placeholder="0"
              hint={form.price > 0 ? formatPrice(form.price) : t("common.free")}
              error={errors.price}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.priceNegotiable}
                onChange={(e) => set("priceNegotiable", e.target.checked)}
                className="rounded accent-sky-500 w-4 h-4"
              />
              <span className="text-sm text-gray-700">{t("create.negotiable")}</span>
            </label>
            <Select
              label={t("create.locationLabel")}
              options={ALL_LOCATIONS.map((l) => ({
                value: l.id,
                label: l.isNeighborhood ? `${l.name} (${l.commune})` : l.name,
              }))}
              value={form.locationId}
              onChange={(e) => set("locationId", e.target.value)}
              placeholder={t("create.locationLabel")}
              error={errors.locationId}
            />
          </div>
        )}

        {/* Step 4: Photos */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{t("create.photos")}</h2>
              <p className="text-sm text-gray-500">
                {t("create.photosHelp", { count: FREE_IMAGE_LIMIT })}
              </p>
            </div>
            <ImageUploader
              userId={user?.id ?? ""}
              listingId={form.pendingListingId}
              onChange={(urls) => set("imageUrls", urls)}
              initialUrls={mode === "edit" ? initialData?.imageUrls : undefined}
            />
          </div>
        )}

        {/* Step 5: Preview */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {t("create.previewTitle")}
              </h2>
              <p className="text-sm text-gray-500">
                {t("create.previewHelp")}
              </p>
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {serverError}
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-5 space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedCategory?.icon}</span>
                <span className="text-xs text-gray-500 font-medium">
                  {selectedCategory ? t(`category.${selectedCategory.slug}` as TranslationKey) : ""}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-base">{form.title || "—"}</p>
                <p className="text-gray-500 mt-1 leading-relaxed line-clamp-3">{form.description || "—"}</p>
              </div>
              {form.imageUrls.length > 0 && (
                <div className="flex gap-2">
                  {form.imageUrls.slice(0, 4).map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={url} alt="" className="w-14 h-14 rounded-lg object-cover" />
                  ))}
                  {form.imageUrls.length > 4 && (
                    <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                      +{form.imageUrls.length - 4}
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="font-bold text-gray-900 text-lg">
                  {form.price > 0 ? formatPrice(form.price) : t("common.free")}
                  {form.priceNegotiable && (
                    <span className="ml-1 text-xs font-normal text-gray-400">({t("common.negotiable")})</span>
                  )}
                </span>
                <span className="text-gray-500">{selectedLocation?.name ?? "—"}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              {mode === "edit"
                ? t("create.terms")
                : t("create.terms")}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={prev}
            disabled={step === 1}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("common.previous")}
          </Button>

          {step < TOTAL_STEPS ? (
            <Button onClick={next} className="gap-1.5">
              {t("common.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting} className="gap-1.5">
              {submitting
                ? t("create.publishing")
                : mode === "edit" ? t("common.save") : t("create.publish")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
