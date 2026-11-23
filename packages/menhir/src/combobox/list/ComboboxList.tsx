import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useComboboxContext } from "../root/ComboboxContext.ts";

// The List's `id` is the Root's, which the Input names before the List is
// rendered (PLAN.md section 8, "Generated ids belong to the root").
export interface ComboboxListProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "id"
> {
  render?: RenderProp;
}

/**
 * The list of items: a `<div role="listbox">` with the `id` the Input
 * names in `aria-controls`. Name it with `aria-labelledby`, such as the
 * `id` of the input's `<label>`, or `aria-label`. Place it inside
 * `Combobox.Popup`, around the items.
 */
export function ComboboxList(props: ComboboxListProps) {
  const combobox = useComboboxContext();
  const elementProps = mergeElementProps(
    { id: combobox.listId, role: "listbox" },
    // Kept out, as typed: a stray one would break `aria-controls`.
    omit(props, "render", "id" as keyof ComboboxListProps),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
