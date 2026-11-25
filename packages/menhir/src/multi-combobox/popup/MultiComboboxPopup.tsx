import { ComboboxPopup } from "../../combobox/popup/ComboboxPopup.tsx";
import type { ComboboxPopupProps } from "../../combobox/popup/ComboboxPopup.tsx";
import { useComboboxContext } from "../../combobox/root/ComboboxContext.ts";
import type { MultiCombobox } from "../root/MultiComboboxContext.ts";

export type MultiComboboxPopupProps = ComboboxPopupProps;

/**
 * The box the list shows in: Combobox's `<div popover="manual">`, placed
 * against `MultiCombobox.Chips`, else the Input, unless `anchor` says
 * otherwise. Place `MultiCombobox.List` inside it, and
 * `MultiCombobox.Status` beside the List. Place it inside
 * `MultiCombobox.Root`.
 */
export function MultiComboboxPopup(props: MultiComboboxPopupProps) {
  const multi = useComboboxContext<MultiCombobox>("MultiCombobox");
  // The Chips box is what looks like the input: chips sit beside the text.
  return (
    <ComboboxPopup {...props} anchor={props.anchor ?? (() => multi.box)} />
  );
}
