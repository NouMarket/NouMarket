import "server-only";

import type { TranslationKey } from "./dictionaries";
import { getServerDictionary } from "./server";
import { translate } from "./translate";

export async function actionError(
  key: TranslationKey,
  params?: Record<string, string | number>
) {
  return translate(await getServerDictionary(), key, params);
}
