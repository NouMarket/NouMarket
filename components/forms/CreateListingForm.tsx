"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { ALL_LOCATIONS } from "@/data/locations";
import { CONDITION_OPTIONS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { CreateListingFormData } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  "Catégorie",
  "Détails",
  "Prix & lieu",
  "Photos",
  "Aperçu",
];

type FormState = Omit<CreateListingFormData, "images"> & {
  imageUrls: string[];
};

const EMPTY_FORM: FormState = {
  categorySlug: "",
  title: "",
  description: "",
  condition: "",
  price: 0,
  priceNegotiable: false,
  locationId: "",
  imageUrls: [],
};

export default function CreateListingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

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
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    router.push("/?submitted=1");
  }

  const selectedCategory = CATEGORIES.find((c) => c.slug === form.categorySlug);
  const selectedLocation = ALL_LOCATIONS.find((l) => l.id === form.locationId);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          {STEP_LABELS.map((label, i) => {
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
                {i < STEP_LABELS.length - 1 && (
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
            <h2 className="text-xl font-bold text-gray-900 mb-1">Choisissez une catégorie</h2>
            <p className="text-sm text-gray-500 mb-6">
              Sélectionnez la catégorie la plus adaptée à votre annonce.
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
                  <span className="text-sm font-medium text-gray-800">{cat.labelFr}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Détails de l&apos;annonce</h2>
              <p className="text-sm text-gray-500">
                Décrivez votre bien avec précision pour attirer les bons acheteurs.
              </p>
            </div>
            <Input
              label="Titre de l'annonce"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ex : iPhone 15 Pro Max 256 Go – Comme neuf"
              error={errors.title}
              hint={`${form.title.length}/80 caractères`}
              maxLength={80}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Description</label>
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
                label="État"
                options={CONDITION_OPTIONS}
                value={form.condition}
                onChange={(e) => set("condition", e.target.value)}
                placeholder="Sélectionner l'état"
              />
            )}
          </div>
        )}

        {/* Step 3: Price & location */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Prix et localisation</h2>
              <p className="text-sm text-gray-500">
                Indiquez votre prix en francs CFP (XPF) et la localisation de votre bien.
              </p>
            </div>
            <Input
              label="Prix (XPF)"
              type="number"
              min={0}
              value={form.price || ""}
              onChange={(e) => set("price", Number(e.target.value))}
              placeholder="0"
              hint={form.price > 0 ? formatPrice(form.price) : "Laissez 0 pour afficher « À discuter »"}
              error={errors.price}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.priceNegotiable}
                onChange={(e) => set("priceNegotiable", e.target.checked)}
                className="rounded accent-sky-500 w-4 h-4"
              />
              <span className="text-sm text-gray-700">Prix négociable</span>
            </label>
            <Select
              label="Localité"
              options={ALL_LOCATIONS.map((l) => ({
                value: l.id,
                label: l.isNeighborhood ? `${l.name} (${l.commune})` : l.name,
              }))}
              value={form.locationId}
              onChange={(e) => set("locationId", e.target.value)}
              placeholder="Sélectionnez une localité"
              error={errors.locationId}
            />
          </div>
        )}

        {/* Step 4: Photos */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Photos</h2>
              <p className="text-sm text-gray-500">
                Ajoutez jusqu&apos;à 8 photos. La première sera l&apos;image principale.
              </p>
            </div>

            {/* Upload area */}
            <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-colors">
              <input type="file" accept="image/*" multiple className="sr-only" disabled />
              <Upload className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">
                Cliquez pour ajouter des photos
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG – max 5 Mo par photo</p>
            </label>

            {/* Demo images shown */}
            <div className="grid grid-cols-4 gap-2">
              {["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80"].map(
                (url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white">
                      <X className="h-3 w-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                        Principale
                      </span>
                    )}
                  </div>
                )
              )}
            </div>
            <p className="text-xs text-gray-400 italic">
              Note : l&apos;upload de photos sera actif après intégration Supabase Storage.
            </p>
          </div>
        )}

        {/* Step 5: Preview */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Aperçu & publication</h2>
              <p className="text-sm text-gray-500">Vérifiez votre annonce avant de la publier.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedCategory?.icon}</span>
                <span className="text-xs text-gray-500 font-medium">{selectedCategory?.labelFr}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-base">{form.title || "—"}</p>
                <p className="text-gray-500 mt-1 leading-relaxed">{form.description || "—"}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="font-bold text-gray-900 text-lg">
                  {form.price > 0 ? formatPrice(form.price) : "À discuter"}
                  {form.priceNegotiable && (
                    <span className="ml-1 text-xs font-normal text-gray-400">(négociable)</span>
                  )}
                </span>
                <span className="text-gray-500">{selectedLocation?.name ?? "—"}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              En publiant, vous acceptez les conditions d&apos;utilisation de NouMarket. Votre annonce sera
              examinée par notre équipe avant d&apos;être mise en ligne (moins de 24h).
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
            Retour
          </Button>

          {step < TOTAL_STEPS ? (
            <Button onClick={next} className="gap-1.5">
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting} className="gap-1.5">
              {submitting ? "Publication…" : "Publier l'annonce"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
