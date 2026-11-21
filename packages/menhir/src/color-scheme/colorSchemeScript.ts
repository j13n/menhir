import type { PreferenceStorage } from "../core/preference/preference.ts";
import { scriptLiteral } from "../core/preference/preference.ts";
import { preferenceScript } from "../core/preference/preferenceScript.ts";

import {
  resolvedSchemes,
  darkQuery,
  defaultAttribute,
  defaultStorageKey,
} from "./colorScheme.ts";
import type { ColorSchemeOptions } from "./colorScheme.ts";

/**
 * `colorSchemeScript` of each entry point, with the entry point's storage: the
 * source of a script for the document head that applies the saved choice,
 * or the system preference, before the page first paints.
 */
export function colorSchemeScriptWithStorage(
  storage: PreferenceStorage,
  options: ColorSchemeOptions = {},
): string {
  return preferenceScript(storage, {
    storageKey: options.storageKey ?? defaultStorageKey,
    attribute: options.attribute ?? defaultAttribute,
    values: resolvedSchemes,
    fallback: `matchMedia(${scriptLiteral(darkQuery)}).matches?"dark":"light"`,
  });
}
