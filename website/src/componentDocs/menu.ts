import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

// `what` finishes "Renders the …".
const render = (what: string) => ({
  name: "render",
  type: "(props) => JSX.Element",
  description: `Renders the ${what}. Read once.`,
});

const focusTarget =
  "HTMLElement | ((focused) => HTMLElement | null | undefined)";

const openState = (what: string) => [
  {
    name: "open",
    type: "boolean",
    description: `Whether the ${what} is open, when controlled. Pair it with onOpenChange.`,
  },
  {
    name: "defaultOpen",
    type: "boolean",
    default: "false",
    description: `Whether the ${what} is open at first, when uncontrolled.`,
  },
];

const itemProps = [
  {
    name: "disabled",
    type: "boolean",
    description:
      "Whether it is disabled: the keys and the pointer still reach it, as the menu pattern asks, but it is not activated and its onClick is not called.",
  },
  {
    name: "label",
    type: "string",
    description:
      "The text typing a character matches, when the item's content is not its label, such as an icon and a shortcut beside the text.",
  },
];

export const menuDoc: ComponentDoc = {
  slug: "menu",
  name: "Menu",
  category: "Menus & navigation",
  description:
    'A list of actions or options that a button opens, with submenus: the WAI-ARIA menu button and menu patterns. The Popup is a popover="auto" element, so the browser puts it in the top layer, above every z-index, and closes it on Escape or a press outside; there is no portal. Focus goes to the first item when it opens; the arrow keys, Home and End move through the items, wrapping at the ends, and typing a character moves to the next item that starts with it. Activating an item calls its onClick and closes every open menu, and focus returns to the Trigger. A submenu opens when the pointer rests on its trigger, or by Right Arrow, Enter or Space, and it stays open while the pointer crosses to it diagonally, over the items in between. The active item has data-active. Menhir places each Popup with Floating UI, below the Trigger and aligned to its start, or at the inline end of a submenu\'s trigger, flipping it when it would leave the viewport, and keeps it shown until its exit animation has ended. Use an <hr> as a separator. For site navigation, use Navigation Menu: a menu is for actions in an application.',
  anatomy: tsx`<Menu.Root>
  <Menu.Trigger />
  <Menu.Popup>
    <Menu.Item />
    <Menu.CheckboxItem>
      <Menu.ItemIndicator />
    </Menu.CheckboxItem>
    <Menu.Group>
      <Menu.GroupLabel />
    </Menu.Group>
    <Menu.RadioGroup>
      <Menu.RadioItem>
        <Menu.ItemIndicator />
      </Menu.RadioItem>
    </Menu.RadioGroup>
    <hr />
    <Menu.Submenu>
      <Menu.SubmenuTrigger />
      <Menu.Popup />
    </Menu.Submenu>
  </Menu.Popup>
</Menu.Root>`,
  api: [
    {
      part: "Root",
      description:
        "Holds the open state and renders no element. The Trigger and the Popup have data-open or data-closed.",
      props: [
        ...openState("menu"),
        {
          name: "onOpenChange",
          type: "(open: boolean, details: { reason, event }) => void",
          description:
            'Called with the new value when the user opens or closes the menu, and why: "trigger-press", "item-press" (an item was activated), "escape-key", "outside-press", "focus-out" (Tab moved focus out) or "close-request" (such as another popover opening). A controlled menu changes only if open does.',
        },
      ],
    },
    {
      part: "Trigger",
      description:
        '<button type="button" aria-haspopup="menu"> that opens and closes the menu, with aria-expanded and with popovertarget and aria-controls naming the Popup, which it labels. Name it with its content. Its render function must render a <button>.',
      props: [render("trigger with your own button component")],
    },
    {
      part: "Popup",
      description:
        '<div popover="auto" role="menu">, placed against its trigger and labelled by it; without a Trigger, give it an aria-label. Its id is generated, for the trigger to name. Render it right after the Trigger, or right after a submenu\'s SubmenuTrigger.',
      props: [
        {
          name: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"bottom", in a submenu the inline end',
          description:
            "The side of its trigger it is placed against. It moves to the other side when it does not fit, and data-side says where it went.",
        },
        {
          name: "align",
          type: '"start" | "center" | "end"',
          default: '"start"',
          description:
            "Where along that side it sits. start and end follow the writing direction.",
        },
        {
          name: "sideOffset",
          type: "number",
          default: "0",
          description: "The gap between its trigger and the Popup, in pixels.",
        },
        {
          name: "alignOffset",
          type: "number",
          default: "0",
          description: "The shift along its trigger's side, in pixels.",
        },
        {
          name: "collisionPadding",
          type: "number",
          default: "5",
          description:
            "The space it keeps from the viewport's edges, in pixels.",
        },
        {
          name: "anchor",
          type: "Element | VirtualElement | (() => Element | VirtualElement | undefined)",
          description:
            "What it is placed against instead of its trigger: an element, a virtual element with a getBoundingClientRect(), such as a point, or a function returning one, for an element you hold in a ref.",
        },
        {
          name: "returnFocus",
          type: focusTarget,
          description:
            "Where focus goes once it has closed with focus inside, instead of its trigger. A function gets the element the browser focused, or null.",
        },
        render("popup with your own component"),
      ],
    },
    {
      part: "Item",
      description:
        '<div role="menuitem">. A click, Enter or Space calls its onClick and closes every open menu. Render a link with render; Enter then follows it.',
      props: [
        ...itemProps,
        render("item with your own component, such as a link"),
      ],
    },
    {
      part: "CheckboxItem",
      description:
        '<div role="menuitemcheckbox"> with aria-checked and data-checked or data-unchecked. A click and Enter change it and close the menu; Space changes it and keeps the menu open.',
      props: [
        {
          name: "checked",
          type: "boolean",
          description:
            "Whether it is checked, when controlled. Pair it with onCheckedChange.",
        },
        {
          name: "defaultChecked",
          type: "boolean",
          default: "false",
          description: "Whether it is checked at first, when uncontrolled.",
        },
        {
          name: "onCheckedChange",
          type: "(checked: boolean) => void",
          description: "Called with the new value when the user changes it.",
        },
        ...itemProps,
        render("item with your own component"),
      ],
    },
    {
      part: "RadioGroup",
      description:
        '<div role="group"> that holds which of its RadioItems is checked, named by its GroupLabel.',
      props: [
        {
          name: "value",
          type: "string | null",
          description:
            "The checked item's value, when controlled; null checks none. Pair it with onValueChange.",
        },
        {
          name: "defaultValue",
          type: "string | null",
          default: "null",
          description: "The checked item's value at first, when uncontrolled.",
        },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          description: "Called with the value of the item the user checks.",
        },
        render("group with your own component"),
      ],
    },
    {
      part: "RadioItem",
      description:
        '<div role="menuitemradio"> with aria-checked and data-checked or data-unchecked. A click and Enter check it and close the menu; Space checks it and keeps the menu open.',
      props: [
        {
          name: "value",
          type: "string",
          description: "The value its group holds while it is checked.",
        },
        ...itemProps,
        render("item with your own component"),
      ],
    },
    {
      part: "ItemIndicator",
      description:
        "aria-hidden <span> with its item's data-checked or data-unchecked, always rendered: show a check mark by state with CSS.",
      props: [render("indicator with your own component")],
    },
    {
      part: "Group",
      description:
        '<div role="group"> for items that belong together, named by its GroupLabel.',
      props: [render("group with your own component")],
    },
    {
      part: "GroupLabel",
      description:
        "<div> that names its Group or RadioGroup. The keys do not reach it. Takes your id, else a generated one.",
      props: [render("label with your own component")],
    },
    {
      part: "Submenu",
      description:
        "Holds a submenu's open state, as the Root does, and renders no element. Place it inside a Popup, around a SubmenuTrigger and the submenu's Popup.",
      props: [
        ...openState("submenu"),
        {
          name: "onOpenChange",
          type: "(open: boolean, details: { reason, event }) => void",
          description:
            'Called with the new value, and why: "trigger-hover", "trigger-press", "arrow-key" (Right or Left Arrow, or Up, Down, Home, End or typing moving through the menu around it), "item-press", "escape-key" or "outside-press".',
        },
        {
          name: "delay",
          type: "number",
          default: "100",
          description:
            "How long the pointer rests on the SubmenuTrigger before the submenu opens, in milliseconds.",
        },
        {
          name: "closeDelay",
          type: "number",
          default: "0",
          description:
            "How long after the pointer has left the SubmenuTrigger and the submenu it closes, in milliseconds. The pointer may cross to the submenu diagonally without a delay.",
        },
      ],
    },
    {
      part: "SubmenuTrigger",
      description:
        '<div role="menuitem" aria-haspopup="menu"> with aria-expanded and data-open or data-closed: an item of the menu around it that opens its submenu, which it labels.',
      props: [...itemProps, render("item with your own component")],
    },
  ],
  keyboard: [
    {
      keys: "Enter, Space",
      action:
        "On the Trigger, opens the menu with focus on its first item. On an item, activates it and closes every menu; Space on a checkbox or radio item changes it and keeps the menu open. On a SubmenuTrigger, opens the submenu with focus on its first item.",
    },
    {
      keys: "Down Arrow",
      action:
        "On the Trigger, opens the menu with focus on its first item. In a menu, moves to the next item, from the last to the first.",
    },
    {
      keys: "Up Arrow",
      action:
        "On the Trigger, opens the menu with focus on its last item. In a menu, moves to the previous item, from the first to the last.",
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
        "Closes the menu that has focus, and returns focus to the Trigger or SubmenuTrigger that opened it.",
    },
    {
      keys: "Tab, Shift + Tab",
      action:
        "Closes every menu; Tab moves focus to what follows the Trigger, Shift + Tab to the Trigger.",
    },
  ],
};
