export const locales = ["fr", "tr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";
export const localeCookieName = "noumarket-locale";
export const localeStorageKey = "noumarket-locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && locales.includes(value as Locale);
}

export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}
