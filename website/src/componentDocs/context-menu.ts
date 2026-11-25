import { tsx } from "../highlight";
import { menuDoc } from "./menu";
import type { ComponentDoc } from "./types";

// `what` finishes "Renders the …".
const render = (what: string) => ({
  name: "render",
  type: "(props) => JSX.Element",
  description: `Renders the ${what}. Read once.`,
});

// The Popup's props are Menu's, with some described for a context menu.
const menuPopup = menuDoc.api.find((part) => part.part === "Popup")!;
const menuPopupProp = (name: string) =>
  menuPopup.props.find((prop) => prop.name === name)!;

export const contextMenuDoc: ComponentDoc = {
  slug: "context-menu",
  name: "Context Menu",
  category: "Menus & navigation",
  summary:
    "A menu of actions for an area of the page that opens on a right-click, a long press or Shift+F10.",
  description:
    "A menu of actions for an area of the page, such as a file in a list, that opens at the pointer on a right-click, a Ctrl+click on macOS or, on Android, a long press, and from the keyboard with Shift+F10 or the Menu key: the browser fires the contextmenu event for each, and Menhir cancels it, so the browser's own menu does not show. It is a Menu opened from an area instead of a button, so its items, submenus, keys and typeahead are Menu's, and an app with both components pays for them once. From the keyboard it opens below the focused element. A right-click while it is open moves it, and one inside it shows no browser menu over it. Focus goes to the first item, and returns where it was once the menu closes. The area is a plain <div> with no role, as ARIA gives a context menu none, so keep its actions reachable another way too, such as a Menu button: iOS Safari fires no contextmenu on a long press. Name the Popup with aria-label.",
  anatomy: tsx`<ContextMenu.Root>
  <ContextMenu.Trigger />
  <ContextMenu.Popup>
    <ContextMenu.Item />
    <ContextMenu.CheckboxItem>
      <ContextMenu.ItemIndicator />
    </ContextMenu.CheckboxItem>
    <ContextMenu.Group>
      <ContextMenu.GroupLabel />
    </ContextMenu.Group>
    <ContextMenu.RadioGroup>
      <ContextMenu.RadioItem>
        <ContextMenu.ItemIndicator />
      </ContextMenu.RadioItem>
    </ContextMenu.RadioGroup>
    <hr />
    <ContextMenu.Submenu>
      <ContextMenu.SubmenuTrigger />
      <ContextMenu.Popup />
    </ContextMenu.Submenu>
  </ContextMenu.Popup>
</ContextMenu.Root>`,
  api: [
    {
      part: "Root",
      description:
        "Holds the open state and where the menu was asked for, and renders no element. The Trigger and the Popup have data-open or data-closed.",
      props: [
        {
          name: "open",
          type: "boolean",
          description:
            "Whether the menu is open, when controlled. Pair it with onOpenChange. Opened this way before any right-click, it is placed below the Trigger.",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description:
            "Whether the menu is open at first, when uncontrolled. It is placed below the Trigger.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean, details: { reason, event }) => void",
          description:
            'Called with the new value when the user opens or closes the menu, and why: "trigger-press" (the contextmenu event, or a press on the element it opened from), "item-press" (an item was activated), "escape-key", "outside-press", "focus-out" (Tab moved focus out) or "close-request" (such as another popover opening). A controlled menu changes only if open does.',
        },
      ],
    },
    {
      part: "Trigger",
      description:
        '<div> whose contextmenu event opens the menu: at the pointer, or below the focused element for a key. It has no role and no tabindex: the keyboard opens the menu from a focused element inside it, so give it tabindex="0" if nothing inside it takes focus. It has data-open or data-closed, and data-disabled.',
      props: [
        {
          name: "disabled",
          type: "boolean",
          description:
            "Whether it opens nothing, so the browser's own menu shows instead.",
        },
        render("area with your own component"),
      ],
    },
    {
      part: "Popup",
      description:
        '<div popover="auto" role="menu">, Menu\'s Popup, placed at the pointer, or below the element a key opened it from: its top-left corner at the pointer, its bottom-left near the bottom of the viewport. Name it with aria-label. Render it right after the Trigger, or right after a submenu\'s SubmenuTrigger, where it is placed as in Menu.',
      props: [
        {
          ...menuPopupProp("side"),
          description:
            "The side of the pointer it is placed against. It moves to the other side when it does not fit, and data-side says where it went.",
        },
        menuPopupProp("align"),
        menuPopupProp("sideOffset"),
        menuPopupProp("alignOffset"),
        menuPopupProp("collisionPadding"),
        {
          ...menuPopupProp("anchor"),
          description:
            "What it is placed against instead of the pointer: an element, a virtual element with a getBoundingClientRect(), or a function returning one.",
        },
        {
          ...menuPopupProp("returnFocus"),
          description:
            "Where focus goes once it has closed with focus inside, instead of the element it opened from. A function gets the element the browser focused, or null.",
        },
        render("popup with your own component"),
      ],
    },
    // The items, groups and submenus are Menu's.
    ...menuDoc.api.filter(
      (part) => !["Root", "Trigger", "Popup"].includes(part.part),
    ),
  ],
  keyboard: [
    {
      keys: "Shift + F10, Menu key",
      action:
        "On a focused element in the Trigger, opens the menu below it with focus on its first item. Not every platform has these keys; macOS has neither.",
    },
    {
      keys: "Enter, Space",
      action:
        "On an item, activates it and closes every menu; Space on a checkbox or radio item changes it and keeps the menu open. On a SubmenuTrigger, opens the submenu with focus on its first item.",
    },
    {
      keys: "Down Arrow, Up Arrow",
      action:
        "Moves to the next or previous item, wrapping from the last to the first and back.",
    },
    {
      keys: "Right Arrow",
      action:
        "On a SubmenuTrigger, opens the submenu with focus on its first item. Left Arrow right to left.",
    },
    {
      keys: "Left Arrow",
      action:
        "In a submenu, closes it and moves focus to its SubmenuTrigger. Right Arrow right to left.",
    },
    { keys: "Home, End", action: "Moves to the first or last item." },
    {
      keys: "A character",
      action:
        "Moves to the next item whose label starts with it; characters typed within a second make one string.",
    },
    {
      keys: "Escape",
      action:
        "Closes the menu that has focus, and returns focus to where it was before the menu opened, or to the SubmenuTrigger.",
    },
    { keys: "Tab, Shift + Tab", action: "Closes every menu." },
  ],
};
