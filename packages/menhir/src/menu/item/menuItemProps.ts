import type { JSX } from "@solidjs/web";
import { onSettled } from "solid-js";

import { callHandler } from "../../core/mergeElementProps.ts";
import type { Handler } from "../../core/mergeElementProps.ts";
import type { ElementProps } from "../../core/renderElement.tsx";
import type { Menu, MenuItemEntry } from "../root/MenuContext.ts";

/** The props every kind of item takes. */
export interface MenuItemBaseProps extends JSX.HTMLAttributes<HTMLElement> {
  /**
   * Whether the item is disabled: still reached by the keys and the
   * pointer, but not activated.
   */
  disabled?: boolean;
  /**
   * The text typeahead matches, when the item's content is not its label,
   * such as an icon and a shortcut beside the text.
   */
  label?: string;
}

/** What kind of item `menuItemProps` makes, and what activating it does. */
export interface MenuItemOptions {
  readonly role: "menuitem" | "menuitemcheckbox" | "menuitemradio";
  /**
   * Called on a click, Enter or Space, unless the item is disabled, with the
   * key event that activated it, if any. It runs after the consumer's
   * `onClick`, which a disabled item does not call.
   */
  onActivate(event: MouseEvent, key: KeyboardEvent | undefined): void;
  /** The menu a SubmenuTrigger opens. */
  readonly submenu?: Menu;
  /** Receives the element, as the item's own ref does. */
  ref?(element: HTMLElement): void;
}

/**
 * The own props of an item of `menu`: its role, its place in the list's
 * roving focus, typeahead, and activation.
 */
export function menuItemProps(
  menu: Menu,
  props: MenuItemBaseProps,
  options: MenuItemOptions,
): ElementProps {
  let element!: HTMLElement;
  const item: MenuItemEntry = {
    get element() {
      return element;
    },
    get text() {
      return props.label;
    },
    get disabled() {
      return props.disabled;
    },
    submenu: options.submenu,
  };
  // A SubmenuTrigger is where Left Arrow in its submenu moves back to.
  if (options.submenu) options.submenu.triggerItem = item;
  onSettled(() => menu.list.register(item));
  // The key event whose click is under way, for `onActivate`.
  let key: KeyboardEvent | undefined;
  return {
    role: options.role,
    get tabindex() {
      return menu.list.isActive(item) ? 0 : -1;
    },
    get "data-active"() {
      return menu.list.isActive(item) ? "" : undefined;
    },
    get "aria-disabled"() {
      return props.disabled ? "true" : undefined;
    },
    get "data-disabled"() {
      return props.disabled ? "" : undefined;
    },
    onKeyDown: (event: KeyboardEvent) => {
      // A key that moves through the menu, typed or Up, Down, Home or End,
      // closes the submenu that was open.
      const closeSubmenus = () =>
        menu.closeSubmenus({ reason: "arrow-key", event });
      if (menu.typeahead.onKeyDown(event)) {
        closeSubmenus();
        return;
      }
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))
        closeSubmenus();
      if (menu.list.onKeyDown(event) || event.target !== element) return;
      if (event.key !== " " && event.key !== "Enter") return;
      // A link follows itself on Enter, with a click of its own.
      if (event.key === "Enter" && element.matches("a[href]")) return;
      event.preventDefault();
      key = event;
      element.click();
      key = undefined;
    },
    onPointerMove: (event: PointerEvent) =>
      menu.list.onPointerMove(item, event),
    onClick: (event: MouseEvent) => {
      // Nor does a disabled link follow itself, by a click or Enter.
      if (props.disabled) {
        event.preventDefault();
        return;
      }
      callHandler(props.onClick as Handler | undefined, event);
      options.onActivate(event, key);
    },
    ref: (el: HTMLElement) => {
      element = el;
      options.ref?.(el);
    },
  };
}
