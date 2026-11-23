import type { JSX } from "@solidjs/web";
import { isDev } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { warnUnlessButton } from "../../core/button.ts";
import type { ButtonElementProps } from "../../core/button.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useNavigationMenuItemContext } from "../item/NavigationMenuItemContext.ts";

export interface NavigationMenuTriggerProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The button that shows and hides its Item's Panel: a
 * `<button type="button" aria-expanded>`. A press toggles the Panel, and
 * the pointer resting on it opens it. Place it inside
 * `NavigationMenu.Item`, before `NavigationMenu.Panel`.
 */
export function NavigationMenuTrigger(props: NavigationMenuTriggerProps) {
  const item = useNavigationMenuItemContext();
  const ownProps = merge(item.attributes, {
    type: "button",
    // Solid 2.0 removes an attribute set to false, so spell the value out.
    get "aria-expanded"() {
      return item.open() ? "true" : "false";
    },
    "aria-controls": item.panelId,
    onClick: (event: MouseEvent) => item.toggle(event),
    ref: (element: HTMLElement) => {
      item.trigger = element;
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, "NavigationMenu.Trigger");
    },
  } satisfies ButtonElementProps);
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
