import { tsx } from "../highlight";
import { menuDoc } from "./menu";
import type { ComponentDoc } from "./types";

// `what` finishes "Renders the …".
const render = (what: string) => ({
  name: "render",
  type: "(props) => JSX.Element",
  description: `Renders the ${what}. Read once.`,
});

const menuRoot = menuDoc.api.find((part) => part.part === "Root")!;

export const menubarDoc: ComponentDoc = {
  slug: "menubar",
  name: "Menubar",
  category: "Menus & navigation",
  description:
    "A row of menus that stays on screen, such as File, Edit and View across the top of an editor: the WAI-ARIA menubar pattern. A menubar is for an application's commands; for links to a site's pages, use Navigation Menu, as WAI-ARIA advises. The bar is one tab stop, and the arrow keys, Home, End and typed characters move along it, wrapping at the ends. Each menu is a Menu, opened from an item of the bar, so its items, submenus, keys and typeahead are Menu's, and an app with both components pays for them once. A press, Down Arrow, Enter or Space opens a menu with focus on its first item. Once one menu is open, moving along the bar, by a key or the pointer, opens the next one with focus left on its item in the bar, and Right or Left Arrow inside a menu does the same. Escape closes the open menu and returns focus to its item in the bar; Tab and Shift+Tab close it and leave the bar. Name the bar with aria-label.",
  anatomy: tsx`<Menubar.Root>
  <Menubar.Menu>
    <Menubar.Trigger />
    <Menubar.Popup>
      <Menubar.Item />
      <Menubar.CheckboxItem>
        <Menubar.ItemIndicator />
      </Menubar.CheckboxItem>
      <Menubar.Group>
        <Menubar.GroupLabel />
      </Menubar.Group>
      <Menubar.RadioGroup>
        <Menubar.RadioItem>
          <Menubar.ItemIndicator />
        </Menubar.RadioItem>
      </Menubar.RadioGroup>
      <hr />
      <Menubar.Submenu>
        <Menubar.SubmenuTrigger />
        <Menubar.Popup />
      </Menubar.Submenu>
    </Menubar.Popup>
  </Menubar.Menu>
</Menubar.Root>`,
  api: [
    {
      part: "Root",
      description:
        '<div role="menubar">, the bar, around its Menus. Name it with aria-label or aria-labelledby. It is horizontal.',
      props: [render("bar with your own component")],
    },
    {
      part: "Menu",
      description:
        "One menu of the bar: holds its open state and renders no element. Its Trigger and Popup have data-open or data-closed. Opening another menu of the bar closes this one.",
      props: menuRoot.props.map((prop) =>
        prop.name === "onOpenChange"
          ? {
              ...prop,
              description:
                'Called with the new value when the user opens or closes the menu, and why: "trigger-press", "trigger-hover" (the pointer moved onto another item of the bar while a menu was open), "arrow-key" (a key moved along the bar), "item-press" (an item was activated), "escape-key", "outside-press", "focus-out" (Tab or Shift + Tab moved focus out) or "close-request". A controlled menu changes only if open does.',
            }
          : prop,
      ),
    },
    {
      part: "Trigger",
      description:
        '<button type="button" role="menuitem"> in the bar, with aria-haspopup="menu" and aria-expanded, that opens and closes its menu. The item that last had focus is the bar\'s tab stop, else the first. Render it inside a Menu, right before its Popup.',
      props: [render("item with your own button component")],
    },
    // The Popup, items, groups and submenus are Menu's.
    ...menuDoc.api.filter((part) => !["Root", "Trigger"].includes(part.part)),
  ],
  keyboard: [
    {
      keys: "Right Arrow, Left Arrow",
      action:
        "In the bar, moves to the next or previous item, wrapping; with a menu open, opens that item's menu, focus staying on the item. In a menu, on an item with no submenu, closes the menus and does the same; Left Arrow in a submenu closes it instead, and Right Arrow on a SubmenuTrigger opens its submenu. Mirrored right to left.",
    },
    {
      keys: "Home, End",
      action:
        "Moves to the first or last item, of the bar or of the menu that has focus.",
    },
    {
      keys: "A character",
      action:
        "Moves to the next item, of the bar or of the menu that has focus, whose label starts with it; characters typed within a second make one string.",
    },
    {
      keys: "Down Arrow",
      action:
        "On an item of the bar, opens its menu with focus on its first item. In a menu, moves to the next item, from the last to the first.",
    },
    {
      keys: "Up Arrow",
      action:
        "On an item of the bar, opens its menu with focus on its last item. In a menu, moves to the previous item, from the first to the last.",
    },
    {
      keys: "Enter, Space",
      action:
        "On an item of the bar, opens its menu, or moves into it if open, with focus on its first item. On an item, activates it and closes the menu; Space on a checkbox or radio item changes it and keeps the menu open. On a SubmenuTrigger, opens the submenu with focus on its first item.",
    },
    {
      keys: "Escape",
      action:
        "Closes the menu that has focus, or the open menu of the focused item of the bar, and returns focus to the item it opened from.",
    },
    {
      keys: "Tab, Shift + Tab",
      action: "Closes every menu and moves focus out of the bar.",
    },
  ],
};
