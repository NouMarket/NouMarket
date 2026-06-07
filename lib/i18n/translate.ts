import type { Dictionary, TranslationKey } from "./dictionaries";

type Params = Record<string, string | number>;

export function translate(
  dictionary: Dictionary,
  key: TranslationKey,
  params?: Params
): string {
  let value = dictionary[key] ?? key;

  if (params) {
    for (const [param, replacement] of Object.entries(params)) {
      value = value.replaceAll(`{${param}}`, String(replacement));
    }
  }

  return value;
}
