import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { createRovingList } from "../../floating/list-navigation/roving.ts";
import { createTypeahead } from "../../floating/typeahead/typeahead.ts";
import { MenubarContext } from "./MenubarContext.ts";
import type { Menubar, MenubarItem } from "./MenubarContext.ts";

export interface MenubarRootProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * A row of menus: a `<div role="menubar">` around `Menubar.Menu`s, one tab
 * stop, with Right and Left Arrow, Home, End and typed characters moving
 * between its items. Name it with `aria-label` or `aria-labelledby`.
 */
export function MenubarRoot(props: MenubarRootProps) {
  // Always shown, so its active item lasts: it is the tab stop (README,
  // "Decisions").
  const list = createRovingList<MenubarItem>({
    orientation: "horizontal",
    wrap: true,
  });
  const typeahead = createTypeahead<MenubarItem>({
    get items() {
      return list.items();
    },
    get active() {
      return list.active();
    },
    move: (item) => list.move(item),
  });
  // Whether an item has claimed the tab stop of the server HTML.
  let claimed = false;
  const bar: Menubar = {
    list,
    typeahead,
    claimTabStop: () => !claimed && (claimed = true),
    openMenu: () => list.items().find((item) => item.menu.open())?.menu,
    follow: (open, details) => {
      const to = list
        .items()
        .find((item) => item.element === document.activeElement)?.menu;
      if (!open || !to || to === open) return;
      open.close(details);
      to.keepFocus = true;
      to.setOpen(true, details);
      // For this opening only. One that goes through has used it by the
      // next task, after its flushes; a controlled menu that refused it
      // must not keep focus on the bar when it opens later.
      setTimeout(() => (to.keepFocus = false));
    },
    moveTo: (item, details) => {
      const open = bar.openMenu();
      list.move(item);
      bar.follow(open, details);
    },
  };
  const ownProps: ElementProps = {
    role: "menubar",
    // Shift+Tab from a menu goes out of the bar, not to the menu's item in
    // it, which keeps the tab stop: focus moves to the item first, and the
    // browser's own move then goes on from there. The menu closes as focus
    // leaves it by Tab (README, "Decisions").
    onKeyDown: (event: KeyboardEvent) => {
      if (
        event.key !== "Tab" ||
        !event.shiftKey ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      const open = bar.openMenu();
      if (open?.popup?.contains(event.target as Node)) open.trigger?.focus();
    },
  };
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return (
    <MenubarContext value={bar}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </MenubarContext>
  );
}
