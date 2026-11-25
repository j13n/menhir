import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

// `what` finishes "Renders the …".
const render = (what: string) => ({
  name: "render",
  type: "(props) => JSX.Element",
  description: `Renders the ${what}. Read once.`,
});

export const comboboxDoc: ComponentDoc = {
  slug: "combobox",
  name: "Combobox",
  category: "Pickers",
  description:
    'An input that picks one value out of a list: the WAI-ARIA combobox pattern, with list autocomplete and manual selection. Typing opens the list and you filter it: render the items that match the text, with includesText, a separate import that ignores case and accents, or your own search, on the server too. Focus stays in the input, which names the active item in aria-activedescendant: Down and Up move through the items, Enter selects the active one and puts its label in the input, Escape closes the list and, once it is closed, empties the input. When focus leaves, the text goes back to the selected item\'s label. A form control: a visually hidden input beside the Input submits the selected value under name, not the text, blocks a submission while required and empty, and follows a form reset. The Popup is a popover="manual" element, so the browser puts it in the top layer, above every z-index; there is no portal. Menhir places it with Floating UI, below the Input and aligned to its start, and keeps it shown until its exit animation has ended. It writes --anchor-width and --available-height on the Popup: use them for its min-width and max-height. Name the Combobox with a <label> for the Input, and the List with aria-labelledby. To select several values, each shown as a chip, use Multi Combobox.',
  anatomy: tsx`<label for="fruit" id="fruit-label" />
<Combobox.Root>
  <Combobox.Input id="fruit" />
  <Combobox.Trigger />
  <Combobox.Clear />
  <Combobox.Popup>
    <Combobox.List aria-labelledby="fruit-label">
      <Combobox.Item>
        <Combobox.ItemIndicator />
      </Combobox.Item>
      <Combobox.Group>
        <Combobox.GroupLabel />
        <Combobox.Item />
      </Combobox.Group>
    </Combobox.List>
    <Combobox.Status />
  </Combobox.Popup>
</Combobox.Root>`,
  api: [
    {
      part: "Root",
      description:
        "Holds the value, the text in the input and the open state, and renders no element. The Input, the Trigger and the Popup have data-open or data-closed, data-disabled and data-required.",
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
            "Called with the new value when the user selects an item or empties the Combobox, or the form is reset. A controlled Combobox changes only if value does.",
        },
        {
          name: "inputValue",
          type: "string",
          description:
            "The text in the input, when controlled. Pair it with onInputValueChange.",
        },
        {
          name: "defaultInputValue",
          type: "string",
          description:
            "The text at first, when uncontrolled. Without it, the input shows the selected item's label once the items have mounted, and nothing in the server HTML: give it the label of defaultValue when you render on the server.",
        },
        {
          name: "onInputValueChange",
          type: "(text: string, details: { reason, event }) => void",
          description:
            'Called with the new text, and why: "input-change" (the user typed), "item-press" (an item was selected, and the text is its label), "escape-key" or "clear-press" (emptied), "focus-out" (focus left, and the text went back to the selected item\'s label) or "reset". Filter by the text for "input-change" only, and show every item otherwise, so the list shows them all after a selection. A controlled Combobox changes only if inputValue does.',
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
            'Called with the new value when the user opens or closes the list, and why: "input-change" (typing opened it), "arrow-key" (Down, Up, Alt + Down or Alt + Up), "trigger-press", "item-press" (an item was selected), "enter-key" (Enter with no item active), "escape-key" or "focus-out" (focus left the input, as a press outside does). A controlled Combobox changes only if open does.',
        },
        {
          name: "name",
          type: "string",
          description:
            "The name the selected value is submitted under, with the form.",
        },
        {
          name: "form",
          type: "string",
          description:
            "The id of the form the Combobox belongs to, when it is not inside it.",
        },
        {
          name: "required",
          type: "boolean",
          description:
            "Whether the form can be submitted only once an item is selected; text alone is not enough. The Input has aria-required.",
        },
        {
          name: "disabled",
          type: "boolean",
          description:
            "Whether the Combobox ignores the user: the Input and the buttons are disabled, and the value is not submitted.",
        },
      ],
    },
    {
      part: "Input",
      description:
        '<input type="text" role="combobox" aria-autocomplete="list" autocomplete="off"> with aria-expanded, with aria-controls naming the List, and with aria-activedescendant naming the active item. It keeps focus while the list is open. Takes your id, for a <label for>. The hidden input follows it.',
      props: [
        {
          name: "autocomplete",
          type: "string",
          default: '"off"',
          description:
            "What the browser may suggest. Off by default, so its own list does not cover the Combobox's.",
        },
        render("input with your own component"),
      ],
    },
    {
      part: "Trigger",
      description:
        '<button type="button" tabindex="-1"> that opens and closes the list and focuses the input, for the pointer and touch, with aria-expanded and aria-controls naming the List. Out of the tab order, since the input takes the keys; a press leaves focus in the input. Name it with aria-label. Its render function must render a <button>.',
      props: [render("trigger with your own button component")],
    },
    {
      part: "Clear",
      description:
        '<button type="button" tabindex="-1"> that empties the text and the value and focuses the input, as Escape on a closed list does. Name it with aria-label. Its render function must render a <button>.',
      props: [render("button with your own button component")],
    },
    {
      part: "Popup",
      description:
        '<div popover="manual">, placed against the Input, around the List and the Status. It takes no focus, and a press in it moves none. It has the CSS variables --anchor-width, the Input\'s width, and --available-height, the space left in the viewport.',
      props: [
        {
          name: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"bottom"',
          description:
            "The side of the Input it is placed against. It moves to the other side when it does not fit, and data-side says where it went.",
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
          description: "The gap between the Input and the Popup, in pixels.",
        },
        {
          name: "alignOffset",
          type: "number",
          default: "0",
          description: "The shift along the Input's side, in pixels.",
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
            "What it is placed against instead of the Input, such as a box around the Input and its buttons: an element, a virtual element with a getBoundingClientRect(), or a function returning one, for an element you hold in a ref.",
        },
        render("popup with your own component"),
      ],
    },
    {
      part: "List",
      description:
        '<div role="listbox"> around the items, with a generated id for the Input to name. Name it with aria-labelledby, such as the id of the input\'s <label>, or aria-label: labelled by the input, it would be named by the text.',
      props: [render("list with your own component")],
    },
    {
      part: "Item",
      description:
        '<div role="option"> with aria-selected and data-selected or data-unselected. A click selects it, puts its label in the input and closes the list. Takes your id, else a generated one. Render the items that match the text; an item that leaves the list leaves the keys.',
      props: [
        {
          name: "value",
          type: "string",
          description:
            "The Combobox's value while this item is selected. Required, and not an empty string.",
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
            "Its text, when its content is not its label, such as an icon beside it: what the input shows once it is selected.",
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
    {
      part: "Status",
      description:
        '<div role="status">, a polite live region, with what its function returns for the number of items while the list is open, and nothing while it is closed. Beside the List, it is the message for an empty list; visually hidden beside the Input, it tells a screen reader how many items match. For items that load, put it in a <Loading> and read isPending(() => results()) in its function to say a search is in flight.',
      props: [
        {
          name: "children",
          type: "(count: number) => JSX.Element",
          description:
            'What it says for the number of items, such as (count) => count === 0 && "No fruit found". Menhir writes no text of its own.',
        },
        render("status with your own component"),
      ],
    },
  ],
  keyboard: [
    {
      keys: "A character",
      action:
        "Types it and opens the list, with no item active: filter the items by the text.",
    },
    {
      keys: "Down Arrow",
      action:
        "Closed, opens the list on the first item; with Alt, opens it with no item active. Open, moves to the next item, and from the last to the first.",
    },
    {
      keys: "Up Arrow",
      action:
        "Closed, opens the list on the last item. Open, moves to the previous item, and from the first to the last; with Alt, closes the list.",
    },
    {
      keys: "Enter",
      action:
        "Selects the active item, puts its label in the input and closes the list. With no item active, closes the list, and a form submits.",
    },
    {
      keys: "Escape",
      action:
        "Closes the list and keeps the text. On a closed list, empties the text and the value.",
    },
    {
      keys: "Home, End, Left Arrow, Right Arrow",
      action: "Move the caret in the text, as in any text input.",
    },
    {
      keys: "Tab, Shift + Tab",
      action:
        "Closes the list without selecting and moves focus on; the text goes back to the selected item's label.",
    },
  ],
};
