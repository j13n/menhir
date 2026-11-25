import { ComboboxList } from "../../combobox/list/ComboboxList.tsx";
import type { ComboboxListProps } from "../../combobox/list/ComboboxList.tsx";

export type MultiComboboxListProps = ComboboxListProps;

/**
 * The list of items: Combobox's `<div role="listbox">`, with
 * `aria-multiselectable="true"`, since several of its items may be selected.
 * Name it with `aria-labelledby`, such as the `id` of the input's
 * `<label>`, or `aria-label`. Place it inside `MultiCombobox.Popup`.
 */
export function MultiComboboxList(props: MultiComboboxListProps) {
  return <ComboboxList aria-multiselectable="true" {...props} />;
}
