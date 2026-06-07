"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  localeStorageKey,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary, type TranslationKey } from "@/lib/i18n/dictionaries";
import { translate } from "@/lib/i18n/translate";

type Params = Record<string, string | number>;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Params) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function persistLocale(locale: Locale) {
  document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; samesite=lax`;
  localStorage.setItem(localeStorageKey, locale);
}

export default function LanguageProvider({
  initialLocale = defaultLocale,
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const stored = localStorage.getItem(localeStorageKey);
    if (isLocale(stored) && stored !== initialLocale) {
      const timer = window.setTimeout(() => {
        setLocaleState(stored);
        persistLocale(stored);
        router.refresh();
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [initialLocale, router]);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setLocaleState(nextLocale);
      persistLocale(nextLocale);
      router.refresh();
    },
    [router]
  );

  const dictionary = useMemo(() => getDictionary(locale), [locale]);
  const t = useCallback(
    (key: TranslationKey, params?: Params) => translate(dictionary, key, params),
    [dictionary]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used inside LanguageProvider");
  }

  return context;
}
