import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useNavigationMenuItemContext } from "../item/NavigationMenuItemContext.ts";

// No `id`: the Item generates the Panel's, which the Trigger names in
// `aria-controls` (README, "Decisions").
export interface NavigationMenuPanelProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "id"
> {
  render?: RenderProp;
}

/**
 * The links its Item's Trigger shows and hides: a `<div>` in the page's
 * flow, `hidden` while closed, which your CSS places under the Item. Place
 * it inside `NavigationMenu.Item`, after `NavigationMenu.Trigger`.
 */
export function NavigationMenuPanel(props: NavigationMenuPanelProps) {
  const item = useNavigationMenuItemContext();
  const ownProps = merge(item.attributes, {
    id: item.panelId,
    get hidden() {
      return !item.open();
    },
    ref: (element: HTMLElement) => {
      item.panel = element;
    },
  });
  const elementProps = mergeElementProps(
    ownProps,
    // An `id` from untyped code would break the Trigger's `aria-controls`,
    // so it is dropped too.
    omit(props as NavigationMenuPanelProps & { id?: string }, "render", "id"),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
