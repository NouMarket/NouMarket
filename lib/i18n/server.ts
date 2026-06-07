import { cookies } from "next/headers";
import { localeCookieName, resolveLocale } from "./config";
import { getDictionary } from "./dictionaries";

export async function getLocale() {
  const cookieStore = await cookies();
  return resolveLocale(cookieStore.get(localeCookieName)?.value);
}

export async function getServerDictionary() {
  return getDictionary(await getLocale());
}
