import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useComboboxItemContext } from "../item/ComboboxItemContext.ts";

export interface ComboboxItemIndicatorProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The check mark of an item: an `aria-hidden` `<span>` with its item's
 * `data-selected` or `data-unselected`, always rendered, so that CSS shows
 * it by state. Place it inside `Combobox.Item`.
 */
export function ComboboxItemIndicator(props: ComboboxItemIndicatorProps) {
  const ownProps = merge(useComboboxItemContext(), {
    "aria-hidden": "true",
  } as const);
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <span {...p} />);
}
