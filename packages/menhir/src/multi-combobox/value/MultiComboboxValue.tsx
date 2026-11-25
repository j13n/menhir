import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

import { useComboboxContext } from "../../combobox/root/ComboboxContext.ts";
import type { MultiCombobox } from "../root/MultiComboboxContext.ts";

export interface MultiComboboxValueProps {
  /**
   * What it renders for each value, in order, such as a
   * `MultiCombobox.Chip` with the value's label.
   */
  children: (value: string) => JSX.Element;
}

/**
 * The selected values, shown in the app's words: calls its function for each
 * value, in order, and renders what it returns, no element of its own.
 * Keyed by the value, so a chip is created once and kept while its value
 * is. Place it inside `MultiCombobox.Chips`, before the Input.
 */
export function MultiComboboxValue(props: MultiComboboxValueProps) {
  const multi = useComboboxContext<MultiCombobox>("MultiCombobox");
  return <For each={multi.value()}>{(value) => props.children(value)}</For>;
}
