import type { JSX } from "@solidjs/web";
import { createUniqueId, merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { createEscape } from "../../floating/dismissal/escape.ts";
import { createHover } from "../../floating/hover/hover.ts";
import { useNavigationMenuRootContext } from "../root/NavigationMenuRootContext.ts";
import { NavigationMenuItemContext } from "./NavigationMenuItemContext.ts";
import type {
  NavigationMenuItemContextValue,
  NavigationMenuItemStateAttributes,
} from "./NavigationMenuItemContext.ts";

export interface NavigationMenuItemProps extends JSX.HTMLAttributes<HTMLElement> {
  /**
   * Identifies the Item in the Root's value. Without one, the Item uses a
   * generated value, which no other code knows.
   */
  value?: string;
  render?: RenderProp;
}

/**
 * One entry of the bar: an `<li>` around a `NavigationMenu.Trigger` and its
 * `NavigationMenu.Panel`. Place it inside `NavigationMenu.Root`, in the
 * `<ul>` of the bar.
 */
export function NavigationMenuItem(props: NavigationMenuItemProps) {
  const root = useNavigationMenuRootContext("Item");
  const panelId = createUniqueId();
  // Without a value, the Panel's id serves as one, as on an Accordion Item.
  const value = () => props.value ?? panelId;
  const open = () => root.value() === value();
  const attributes: NavigationMenuItemStateAttributes = {
    get "data-open"() {
      return open() ? "" : undefined;
    },
    get "data-closed"() {
      return open() ? undefined : "";
    },
  };
  const context: NavigationMenuItemContextValue = {
    open,
    toggle: (event) => root.toggle(value(), event),
    panelId,
    trigger: undefined,
    panel: undefined,
    attributes,
  };
  let element: HTMLElement | undefined;
  createHover({
    get trigger() {
      return context.trigger;
    },
    get popup() {
      return context.panel;
    },
    get open() {
      return open();
    },
    // Read as the pointer enters: 0 while another Item is open (README,
    // "Moving along the bar").
    get delay() {
      return root.hoverDelay();
    },
    get closeDelay() {
      return root.closeDelay();
    },
    // A Panel that holds focus stays open when the pointer leaves: closing
    // it would drop focus to the page. One a press opened stays open too
    // (`hoverClose`).
    onOpenChange: (next, details) => {
      if (next) root.hoverOpen(value(), details);
      else if (!context.panel?.contains(document.activeElement))
        root.hoverClose(value(), details);
    },
  });
  createEscape({
    get open() {
      return open();
    },
    onDismiss: (details) => {
      // As the example does: focus inside the Item goes back to its
      // Trigger, which stays in the page; focus elsewhere stays there.
      if (element?.contains(document.activeElement)) context.trigger?.focus();
      root.close(details);
    },
  });
  const ownProps = merge(attributes, {
    ref: (el: HTMLElement) => {
      element = el;
    },
  });
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "value"),
  );
  return (
    <NavigationMenuItemContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <li {...p} />
      ))}
    </NavigationMenuItemContext>
  );
}
