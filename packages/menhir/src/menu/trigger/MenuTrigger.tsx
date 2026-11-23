import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { createUniqueId, merge, omit } from "solid-js";

import { warnUnlessButton } from "../../core/button.ts";
import type { ButtonElementProps } from "../../core/button.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useMenuContext } from "../root/MenuContext.ts";

export interface MenuTriggerProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The button that opens and closes the menu: a `<button type="button"
 * aria-haspopup="menu">` with `aria-expanded`, naming the Popup in
 * `popovertarget` and `aria-controls`. Enter, Space and Down Arrow open the
 * menu with focus on its first item, Up Arrow on its last. Place it inside
 * `Menu.Root`, right before `Menu.Popup`.
 */
export function MenuTrigger(props: MenuTriggerProps) {
  const menu = useMenuContext();
  const generated = createUniqueId();
  // The consumer's `id`, else the generated one, which labels the Popup
  // rendered after it. Kept out of the merge, where a wrapper's
  // `id={undefined}` would remove it ("`undefined` is a value", PLAN.md
  // section 8).
  const id = () => props.id ?? generated;
  menu.triggerId = id;
  const ownProps = merge(menu.attributes, {
    type: "button",
    get id() {
      return id();
    },
    // So that the browser counts a press on the Trigger as one on the
    // popover, which light dismiss leaves open (README, "Decisions").
    popovertarget: menu.popupId,
    "aria-haspopup": "menu",
    get "aria-expanded"() {
      return menu.open() ? "true" : "false";
    },
    "aria-controls": menu.popupId,
    onClick: (event: MouseEvent) => {
      // The state shows and hides the popover, in the flush that places
      // it: the browser's own toggle would show it a task before.
      event.preventDefault();
      const details = { reason: "trigger-press", event } as const;
      if (menu.open()) menu.close(details);
      else menu.setOpen(true, details);
    },
    onKeyDown: (event: KeyboardEvent) => {
      const { key } = event;
      if (
        (key !== "ArrowDown" && key !== "ArrowUp") ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      event.preventDefault();
      menu.setOpen(true, { reason: "trigger-press", event });
      const items = menu.list.items();
      menu.list.move(key === "ArrowUp" ? items[items.length - 1] : items[0]);
    },
    ref: (element: HTMLElement) => {
      menu.trigger = element;
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, "Menu.Trigger");
    },
  } satisfies ButtonElementProps & { popovertarget: string });
  const elementProps = mergeElementProps(ownProps, omit(props, "render", "id"));
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
