import type { PreferenceStorage } from "../core/preference/preference.ts";
import { scriptLiteral } from "../core/preference/preference.ts";
import { preferenceScript } from "../core/preference/preferenceScript.ts";

import {
  resolvedModes,
  darkQuery,
  defaultAttribute,
  defaultStorageKey,
} from "./colorMode.ts";
import type { ColorModeOptions } from "./colorMode.ts";

/**
 * `colorModeScript` of each entry point, with the entry point's storage: the
 * source of a script for the document head that applies the saved choice,
 * or the system preference, before the page first paints.
 */
export function colorModeScriptWithStorage(
  storage: PreferenceStorage,
  options: ColorModeOptions = {},
): string {
  return preferenceScript(storage, {
    storageKey: options.storageKey ?? defaultStorageKey,
    attribute: options.attribute ?? defaultAttribute,
    values: resolvedModes,
    fallback: `matchMedia(${scriptLiteral(darkQuery)}).matches?"dark":"light"`,
  });
}
