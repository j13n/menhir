import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useMenuItemIndicatorContext } from "./MenuItemIndicatorContext.ts";

export interface MenuItemIndicatorProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The check mark of a checkbox or radio item: an `aria-hidden` `<span>`
 * with its item's `data-checked` or `data-unchecked`, always rendered, so
 * that CSS shows it by state. Place it inside `Menu.CheckboxItem` or
 * `Menu.RadioItem`.
 */
export function MenuItemIndicator(props: MenuItemIndicatorProps) {
  const ownProps = merge(useMenuItemIndicatorContext(), {
    "aria-hidden": "true",
  } as const);
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <span {...p} />);
}
