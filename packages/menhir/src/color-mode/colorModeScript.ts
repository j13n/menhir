import { darkQuery, defaultAttribute, defaultStorageKey } from "./colorMode.ts";
import type { ColorModeOptions } from "./colorMode.ts";

/**
 * The source of a script for the document head that applies the saved
 * choice, or the system preference, before the page first paints. Pass the
 * options given to `createColorMode`. Render it inline, before any styles
 * that depend on the mode:
 *
 * ```tsx
 * <script innerHTML={colorModeScript()} />
 * ```
 */
export function colorModeScript(options: ColorModeOptions = {}): string {
  const key = literal(options.storageKey ?? defaultStorageKey);
  const attribute = options.attribute ?? defaultAttribute;
  const apply =
    attribute === "class"
      ? 'd.classList.remove(r==="dark"?"light":"dark");d.classList.add(r)'
      : `d.setAttribute(${literal(attribute)},r)`;
  return (
    `(function(){var m;try{m=localStorage.getItem(${key})}catch(e){}` +
    `var r=m==="light"||m==="dark"?m:matchMedia(${literal(darkQuery)}).matches?"dark":"light",` +
    `d=document.documentElement;${apply}})()`
  );
}

/** A string as a JavaScript literal that cannot close the script element. */
function literal(value: string): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
