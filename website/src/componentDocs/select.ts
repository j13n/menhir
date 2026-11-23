import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

// `what` finishes "Renders the …".
const render = (what: string) => ({
  name: "render",
  type: "(props) => JSX.Element",
  description: `Renders the ${what}. Read once.`,
});

export const selectDoc: ComponentDoc = {
  slug: "select",
  name: "Select",
  description:
    'A button that shows one value out of a list and opens the list to change it: the WAI-ARIA select-only combobox with a listbox. A form control: a visually hidden input beside the Trigger submits the value under name, blocks a submission while required and empty, follows a form reset, and takes a value the browser fills in. The Popup is a popover="auto" element, so the browser puts it in the top layer, above every z-index, and closes it on Escape or a press outside; there is no portal. Focus stays on the Trigger, which names the active item in aria-activedescendant: the arrow keys, Home, End, Page Up and Page Down move through the items, and typing moves to the next item that starts with what was typed, on a closed Select too, which opens. Enter, Space, Tab or a click selects an item and closes the list; Escape closes it and keeps the value. The active item has data-active and the selected one data-selected. Menhir places the Popup with Floating UI, below the Trigger and aligned to its start, flipping it when it would leave the viewport, and keeps it shown until its exit animation has ended. It writes --anchor-width and --available-height on the Popup: use them for its min-width and max-height. Name the Select with a <label> for the Trigger.',
  anatomy: tsx`<label for="fruit" />
<Select.Root>
  <Select.Trigger id="fruit">
    <Select.Value />
  </Select.Trigger>
  <Select.Popup>
    <Select.Item>
      <Select.ItemIndicator />
    </Select.Item>
    <Select.Group>
      <Select.GroupLabel />
      <Select.Item />
    </Select.Group>
  </Select.Popup>
</Select.Root>`,
  api: [
    {
      part: "Root",
      description:
        "Holds the value and the open state, and renders no element. The Trigger and the Popup have data-open or data-closed, data-disabled and data-required.",
      props: [
        {
          name: "value",
          type: "string | null",
          description:
            "The selected item's value, when controlled; null selects none. Pair it with onValueChange.",
        },
        {
          name: "defaultValue",
          type: "string | null",
          default: "null",
          description:
            "The selected item's value at first, when uncontrolled. A form reset goes back to it.",
        },
        {
          name: "onValueChange",
          type: "(value: string | null) => void",
          description:
            "Called with the new value when the user selects an item, the browser fills one in, or the form is reset. A controlled Select changes only if value does.",
        },
        {
          name: "open",
          type: "boolean",
          description:
            "Whether the list is open, when controlled. Pair it with onOpenChange.",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description: "Whether the list is open at first, when uncontrolled.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean, details: { reason, event }) => void",
          description:
            'Called with the new value when the user opens or closes the list, and why: "trigger-press" (a press or a key on the Trigger), "item-press" (an item was selected), "escape-key", "outside-press", "focus-out" (Tab) or "close-request" (such as another popover opening). A controlled Select changes only if open does.',
        },
        {
          name: "name",
          type: "string",
          description: "The name the value is submitted under, with the form.",
        },
        {
          name: "form",
          type: "string",
          description:
            "The id of the form the Select belongs to, when it is not inside it.",
        },
        {
          name: "required",
          type: "boolean",
          description:
            "Whether the form can be submitted only once an item is selected. The Trigger has aria-required.",
        },
        {
          name: "disabled",
          type: "boolean",
          description:
            "Whether the Select ignores the user: the Trigger is disabled, and the value is not submitted.",
        },
        {
          name: "autocomplete",
          type: "string",
          description:
            'What the browser may fill in, such as "country". A filled value selects the item with that value, else the one with that label.',
        },
      ],
    },
    {
      part: "Trigger",
      description:
        '<button type="button" role="combobox" aria-haspopup="listbox"> that shows the value and opens the list, with aria-expanded, with popovertarget and aria-controls naming the Popup, and with aria-activedescendant naming the active item. It keeps focus while the list is open. A combobox takes no name from its content: name it with a <label for>, a <label> around it, aria-label or aria-labelledby. The hidden input follows it. Its render function must render a <button>.',
      props: [render("trigger with your own button component")],
    },
    {
      part: "Value",
      description:
        "<span> with the selected item's label: its label prop, else its text. It has data-placeholder while no item is selected. The server cannot read a label from the items, which come after it, so it renders the value itself until the items have mounted; give it a function when your labels differ from your values.",
      props: [
        {
          name: "placeholder",
          type: "JSX.Element",
          description: "What it shows while no item is selected.",
        },
        {
          name: "children",
          type: "(value: string) => JSX.Element",
          description:
            "The label of a value, shown instead of the selected item's own, on the server too.",
        },
        render("value with your own component"),
      ],
    },
    {
      part: "Popup",
      description:
        '<div popover="auto" role="listbox">, placed against the Trigger and labelled by it. It takes no focus. Its id is generated, for the Trigger to name. It has the CSS variables --anchor-width, the Trigger\'s width, and --available-height, the space left in the viewport. Render it right after the Trigger.',
      props: [
        {
          name: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"bottom"',
          description:
            "The side of the Trigger it is placed against. It moves to the other side when it does not fit, and data-side says where it went.",
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
          description: "The gap between the Trigger and the Popup, in pixels.",
        },
        {
          name: "alignOffset",
          type: "number",
          default: "0",
          description: "The shift along the Trigger's side, in pixels.",
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
            "What it is placed against instead of the Trigger: an element, a virtual element with a getBoundingClientRect(), or a function returning one, for an element you hold in a ref.",
        },
        render("popup with your own component"),
      ],
    },
    {
      part: "Item",
      description:
        '<div role="option"> with aria-selected and data-selected or data-unselected. A click selects it and closes the list. Takes your id, else a generated one.',
      props: [
        {
          name: "value",
          type: "string",
          description:
            "The Select's value while this item is selected. Required, and not an empty string.",
        },
        {
          name: "disabled",
          type: "boolean",
          description:
            "Whether it is disabled: the keys and the pointer still reach it, but it is not selected.",
        },
        {
          name: "label",
          type: "string",
          description:
            "Its text, when its content is not its label, such as an icon beside it: what typing matches and the Value shows.",
        },
        render("item with your own component"),
      ],
    },
    {
      part: "ItemIndicator",
      description:
        "aria-hidden <span> with its item's data-selected or data-unselected, always rendered: show a check mark by state with CSS.",
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
        "<div> that names its Group. The keys do not reach it. Takes your id, else a generated one.",
      props: [render("label with your own component")],
    },
  ],
  keyboard: [
    {
      keys: "Enter, Space",
      action:
        "Closed, opens the list on the selected item, else the first. Open, selects the active item and closes the list.",
    },
    {
      keys: "Down Arrow",
      action:
        "Closed, opens the list on the selected item, else the first; with Alt too. Open, moves to the next item, and stops at the last.",
    },
    {
      keys: "Up Arrow",
      action:
        "Closed, opens the list on the first item. Open, moves to the previous item, and stops at the first; with Alt, selects the active item and closes the list.",
    },
    {
      keys: "Home, End",
      action:
        "Moves to the first or last item, and opens the list if it is closed.",
    },
    { keys: "Page Up, Page Down", action: "Moves ten items up or down." },
    {
      keys: "A character",
      action:
        "Moves to the next item whose label starts with it, and opens the list if it is closed, without changing the value; characters typed within a second make one string.",
    },
    {
      keys: "Escape",
      action: "Closes the list and keeps the value.",
    },
    {
      keys: "Tab, Shift + Tab",
      action:
        "Open, selects the active item, closes the list and moves focus on.",
    },
  ],
};
