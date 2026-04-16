import type { Locale, Dict } from "./types";
export type { Locale, Dict };
export { LOCALES } from "./types";

import en from "./en";
import de from "./de";
import fr from "./fr";
import it from "./it";
import ru from "./ru";

const dictionaries: Record<Locale, Dict> = { en, de, fr, it, ru };

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries.en;
}
