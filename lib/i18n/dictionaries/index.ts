import { fr, type Dictionary } from "./fr";
import { tr } from "./tr";
import { defaultLocale, type Locale } from "../config";

export const dictionaries: Record<Locale, Dictionary> = {
  fr,
  tr,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export type { Dictionary, TranslationKey } from "./fr";
