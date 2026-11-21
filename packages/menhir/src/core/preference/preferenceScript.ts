import { scriptLiteral } from "./preference.ts";
import type { PreferenceAttribute, PreferenceStorage } from "./preference.ts";

export interface PreferenceScriptOptions {
  storageKey: string;
  attribute: PreferenceAttribute;
  /** Every value the attribute can hold. A saved value outside it is unset. */
  values: readonly string[];
  /**
   * A JavaScript expression for the value to apply when nothing valid is
   * saved, such as a literal from `scriptLiteral`.
   */
  fallback: string;
}

/**
 * The source of a script for the document head that applies a saved
 * preference, or `fallback`, to `<html>` before the page first paints.
 */
export function preferenceScript(
  storage: PreferenceStorage,
  options: PreferenceScriptOptions,
): string {
  const values = options.values.map(scriptLiteral).join(",");
  const apply =
    options.attribute === "class"
      ? "d.classList.remove.apply(d.classList,l);d.classList.add(r)"
      : `d.setAttribute(${scriptLiteral(options.attribute)},r)`;
  return (
    `(function(){var m,l=[${values}];try{${storage.script(options.storageKey)}}catch(e){}` +
    `var r=l.indexOf(m)>=0?m:${options.fallback},d=document.documentElement;${apply}})()`
  );
}
