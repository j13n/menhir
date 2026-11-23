import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useComboboxContext } from "../../combobox/root/ComboboxContext.ts";
import { createComboboxItem } from "../../combobox/item/createComboboxItem.ts";
import type { Autocomplete } from "../root/AutocompleteContext.ts";

export interface AutocompleteItemProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The text it fills the input with when accepted. */
  value: string;
  /**
   * Whether the item is disabled: still reached by the keys and the
   * pointer, but not accepted.
   */
  disabled?: boolean;
  render?: RenderProp;
}

/**
 * A suggestion: a `<div role="option">`, with `aria-selected="true"` while
 * it is the active item. A click accepts it, sets the input's text to its
 * `value` and closes the list, and so does Enter while it is active; a
 * disabled item is not accepted. Render the suggestions that match the
 * text, and place them inside `Autocomplete.List`.
 */
export function AutocompleteItem(props: AutocompleteItemProps) {
  const autocomplete = useComboboxContext<Autocomplete>("Autocomplete");
  const { item, props: itemProps } = createComboboxItem(
    autocomplete,
    props,
    () => props.value,
  );
  const ownProps = merge(itemProps, {
    // Only on the active item, as the list autocomplete example: there is
    // no selected item, only the text (README, "Decisions").
    get "aria-selected"() {
      return autocomplete.isActive(item) ? "true" : undefined;
    },
  });
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "value", "disabled", "id"),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
