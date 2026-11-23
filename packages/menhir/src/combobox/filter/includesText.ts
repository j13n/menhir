// Made on the first call, never at import time (PLAN.md section 6, rule 2),
// and kept for the page: it holds no state.
let collator: Intl.Collator | undefined;

/**
 * Whether `text` contains `query`, case and accents ignored, with the
 * built-in `Intl.Collator`; an empty query matches everything. The filter
 * for a Combobox whose items match what the user types:
 *
 * ```ts
 * const shown = createMemo(() =>
 *   countries.filter((country) => includesText(country.name, query())),
 * );
 * ```
 */
export function includesText(text: string, query: string): boolean {
  // Composed, so that a letter and its accent are one character in both.
  const haystack = text.normalize();
  const needle = query.normalize();
  collator ??= new Intl.Collator(undefined, { sensitivity: "base" });
  for (let start = 0; start + needle.length <= haystack.length; start++) {
    const slice = haystack.slice(start, start + needle.length);
    if (!collator.compare(slice, needle)) return true;
  }
  return false;
}
