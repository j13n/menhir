import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useContextMenu } from "../root/ContextMenuContext.ts";

export interface ContextMenuTriggerProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Opens nothing, so the browser's own menu shows instead. */
  disabled?: boolean;
  render?: RenderProp;
}

/**
 * The area that opens the menu: a `<div>` whose `contextmenu` event, from a
 * secondary-button press, a long press, Shift+F10 or the Menu key, opens
 * the menu at the pointer, or below the focused element for a key, with
 * focus on its first item. Place it inside `ContextMenu.Root`, right before
 * `ContextMenu.Popup`.
 */
export function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  const menu = useContextMenu();
  const ownProps = merge(menu.attributes, {
    get "data-disabled"() {
      return props.disabled ? "" : undefined;
    },
    onContextMenu: (event: MouseEvent) => {
      if (props.disabled) return;
      event.preventDefault();
      // A key has no pointer: Chromium sends its `contextmenu` with no
      // button, as it does a long press, which is a touch, and the Pointer
      // Events spec with no pointer type (README, "Decisions").
      const { pointerType } = event as PointerEvent;
      const { clientX, clientY } = event;
      menu.setAnchor(
        pointerType === "" || (event.button < 0 && pointerType === "mouse")
          ? (event.target as Element)
          : { getBoundingClientRect: () => new DOMRect(clientX, clientY) },
      );
      // The element the menu opens from, where Menu returns focus when the
      // browser does not, as after an item in a submenu: the element a key
      // was pressed on, or the one a press focused. Not Menu's trigger, so
      // a press on it is a press outside (README, "Decisions").
      const focused = document.activeElement as HTMLElement | null;
      menu.returnTo = focused === document.body ? undefined : focused!;
      const details = { reason: "trigger-press", event } as const;
      // A second one while open moves the menu and starts it over.
      menu.closeSubmenus(details);
      menu.openAtFirst(details);
    },
    ref: (element: HTMLElement) => {
      menu.area = element;
    },
  } satisfies ElementProps);
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "disabled"),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
