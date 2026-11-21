import {
  darkQuery,
  defaultAttribute,
  defaultStorageKey,
  scriptLiteral,
} from "./colorMode.ts";
import type { ColorModeOptions, ColorModeStorage } from "./colorMode.ts";

/**
 * `colorModeScript` of each entry point, with the entry point's storage: the
 * source of a script for the document head that applies the saved choice,
 * or the system preference, before the page first paints.
 */
export function colorModeScriptWithStorage(
  storage: ColorModeStorage,
  options: ColorModeOptions = {},
): string {
  const key = options.storageKey ?? defaultStorageKey;
  const attribute = options.attribute ?? defaultAttribute;
  const apply =
    attribute === "class"
      ? 'd.classList.remove(r==="dark"?"light":"dark");d.classList.add(r)'
      : `d.setAttribute(${scriptLiteral(attribute)},r)`;
  return (
    `(function(){var m;try{${storage.script(key)}}catch(e){}` +
    `var r=m==="light"||m==="dark"?m:matchMedia(${scriptLiteral(darkQuery)}).matches?"dark":"light",` +
    `d=document.documentElement;${apply}})()`
  );
}
