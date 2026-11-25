import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

// `what` finishes "Renders the …".
const render = (what: string) => ({
  name: "render",
  type: "(props) => JSX.Element",
  description: `Renders the ${what}. Read once.`,
});

export const multiComboboxDoc: ComponentDoc = {
  slug: "multi-combobox",
  name: "Multi Combobox",
  category: "Pickers",
  description:
    'A multi-select combobox that selects several values out of a list, each shown as a removable chip: the WAI-ARIA combobox pattern, with several selections from the listbox pattern. It selects from a list you render; typed text that becomes a chip of its own, as in a box of free tags, is another component. It builds on Combobox: typing opens the list and you filter it, with includesText or your own search, and focus stays in the input. Enter or a click adds the active item and keeps the list open, so you can go on adding; selecting a selected item takes it out, and the text empties after each. The listbox has aria-multiselectable and each selected item aria-selected. Backspace in the empty input focuses the last chip and a second Backspace removes it; Left and Right move between the chips and the input, mirrored right to left; Delete removes a chip too, and focus moves to a neighbour. A form control: one hidden input per value submits each under name, required means at least one, and a form reset puts back defaultValue. Trigger, Clear, Group, GroupLabel, Status and ItemIndicator are Combobox\'s parts, so an app that uses both pays for them once. The Popup is a popover="manual" element in the top layer, placed with Floating UI against the Chips box. Menhir writes no text: name each ChipRemove with aria-label, and say a removal in a live region of your own if you want it announced.',
  anatomy: tsx`<label for="toppings" id="toppings-label" />
<MultiCombobox.Root>
  <MultiCombobox.Chips>
    <MultiCombobox.Value>
      {(value) => (
        <MultiCombobox.Chip value={value}>
          <MultiCombobox.ChipRemove />
        </MultiCombobox.Chip>
      )}
    </MultiCombobox.Value>
    <MultiCombobox.Input id="toppings" />
  </MultiCombobox.Chips>
  <MultiCombobox.Trigger />
  <MultiCombobox.Clear />
  <MultiCombobox.Popup>
    <MultiCombobox.List aria-labelledby="toppings-label">
      <MultiCombobox.Item>
        <MultiCombobox.ItemIndicator />
      </MultiCombobox.Item>
      <MultiCombobox.Group>
        <MultiCombobox.GroupLabel />
        <MultiCombobox.Item />
      </MultiCombobox.Group>
    </MultiCombobox.List>
    <MultiCombobox.Status />
  </MultiCombobox.Popup>
</MultiCombobox.Root>`,
  api: [
    {
      part: "Root",
      description:
        "Holds the values, the text in the input and the open state, and renders no element of its own; after its children, it renders the form's hidden inputs. The Chips, the Input, the Trigger and the Popup have data-open or data-closed, data-disabled and data-required.",
      props: [
        {
          name: "value",
          type: "string[]",
          description:
            "The selected items' values, in the order selected, when controlled; [] selects none. Pair it with onValueChange.",
        },
        {
          name: "defaultValue",
          type: "string[]",
          default: "[]",
          description:
            "The values at first, when uncontrolled. A form reset goes back to them.",
        },
        {
          name: "onValueChange",
          type: "(value: string[]) => void",
          description:
            "Called with the new list when the user adds or removes a value, empties the Multi Combobox, or the form is reset. A controlled Multi Combobox changes only if value does.",
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
          default: '""',
          description: "The text at first, when uncontrolled.",
        },
        {
          name: "onInputValueChange",
          type: "(text: string, details: { reason, event }) => void",
          description:
            'Called with the new text, and why: "input-change" (the user typed), "item-press" (an item was added or removed, which empties it), "escape-key" or "clear-press" (emptied), "focus-out" (focus left the input for anything but a chip, which empties it) or "reset". Filter by the text for "input-change" only, and show every item otherwise. A controlled Multi Combobox changes only if inputValue does.',
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
            'Called with the new value when the user opens or closes the list, and why: "input-change", "arrow-key", "trigger-press", "enter-key" (Enter with no item active), "escape-key" or "focus-out". Selecting an item does not close it. A controlled Multi Combobox changes only if open does.',
        },
        {
          name: "name",
          type: "string",
          description:
            "The name each value is submitted under, one entry per value.",
        },
        {
          name: "form",
          type: "string",
          description:
            "The id of the form it belongs to, when it is not inside it.",
        },
        {
          name: "required",
          type: "boolean",
          description:
            "Whether the form can be submitted only once a value is selected; text alone is not enough. The Input has aria-required.",
        },
        {
          name: "disabled",
          type: "boolean",
          description:
            "Whether it ignores the user: the Input and the buttons are disabled, the chips' keys do nothing, and no value is submitted.",
        },
      ],
    },
    {
      part: "Chips",
      description:
        "<div> that looks like the input: the box around the chips and the Input. A press on its own background focuses the input, and the Popup is placed against it.",
      props: [render("box with your own component")],
    },
    {
      part: "Value",
      description:
        "Renders no element: calls its function for each value, in order, keyed by the value, so a chip is created once and kept while its value is. A controlled app may render its own Chips from its array instead.",
      props: [
        {
          name: "children",
          type: "(value: string) => JSX.Element",
          description:
            "What to render for a value, such as a Chip with its label: only your app knows a value's label.",
        },
      ],
    },
    {
      part: "Chip",
      description:
        '<div tabindex="-1"> that shows one value, out of the tab order and named by its text. Backspace in the empty input and Left from the start of the text focus the last one; Left and Right move between them and back to the input; Backspace removes it and focuses the chip before it, Delete the one after it, else the input. Has data-disabled while the Root is disabled.',
      props: [
        {
          name: "value",
          type: "string",
          description: "The value it shows, one of the Root's.",
        },
        render("chip with your own component"),
      ],
    },
    {
      part: "ChipRemove",
      description:
        '<button type="button" tabindex="-1"> inside a Chip that takes its value out and focuses the input, for the pointer; a press leaves the list as it was. Name it with aria-label, such as "Remove Olives". Its render function must render a <button>.',
      props: [render("button with your own button component")],
    },
    {
      part: "Input",
      description:
        '<input type="text" role="combobox" aria-autocomplete="list" autocomplete="off"> with aria-expanded, aria-controls naming the List and aria-activedescendant naming the active item. It keeps focus while the list is open. Takes your id, for a <label for>. In a Field, render it as Field.Control\'s render inside the Root: the Root keeps its own name, required and disabled.',
      props: [
        {
          name: "autocomplete",
          type: "string",
          default: '"off"',
          description:
            "What the browser may suggest. Off by default, so its own list does not cover the Multi Combobox's.",
        },
        render("input with your own component"),
      ],
    },
    {
      part: "Trigger",
      description:
        "Combobox's Trigger: a button out of the tab order that opens and closes the list and focuses the input. Name it with aria-label.",
      props: [render("trigger with your own button component")],
    },
    {
      part: "Clear",
      description:
        "Combobox's Clear: a button out of the tab order that empties the text and every value, and focuses the input. Name it with aria-label.",
      props: [render("button with your own button component")],
    },
    {
      part: "Popup",
      description:
        "<div popover=\"manual\">, placed against the Chips, else the Input, around the List and the Status. It takes no focus, and a press in it moves none. It has the CSS variables --anchor-width, the Chips' width, and --available-height. It takes Combobox's Popup props: side, align, sideOffset, alignOffset, collisionPadding and anchor.",
      props: [render("popup with your own component")],
    },
    {
      part: "List",
      description:
        '<div role="listbox" aria-multiselectable="true"> around the items. Name it with aria-labelledby, such as the id of the input\'s <label>, or aria-label.',
      props: [render("list with your own component")],
    },
    {
      part: "Item",
      description:
        '<div role="option"> with aria-selected and data-selected or data-unselected. A click adds its value, or takes it out once selected, empties the text and keeps the list open. Takes your id, else a generated one.',
      props: [
        {
          name: "value",
          type: "string",
          description: "The value it adds. Required, and not an empty string.",
        },
        {
          name: "disabled",
          type: "boolean",
          description:
            "Whether it is disabled: the keys and the pointer still reach it, but it is neither added nor taken out.",
        },
        render("item with your own component"),
      ],
    },
    {
      part: "ItemIndicator",
      description:
        "Combobox's ItemIndicator: an aria-hidden <span> with its item's data-selected or data-unselected, always rendered.",
      props: [render("indicator with your own component")],
    },
    {
      part: "Group",
      description:
        'Combobox\'s Group: a <div role="group"> for items that belong together, named by its GroupLabel.',
      props: [render("group with your own component")],
    },
    {
      part: "GroupLabel",
      description: "Combobox's GroupLabel: a <div> that names its Group.",
      props: [render("label with your own component")],
    },
    {
      part: "Status",
      description:
        'Combobox\'s Status: a <div role="status"> with what its function returns for the number of items while the list is open, such as a message for an empty list.',
      props: [
        {
          name: "children",
          type: "(count: number) => JSX.Element",
          description: "What it says for the number of items.",
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
      keys: "Down Arrow, Up Arrow",
      action:
        "Closed, open the list on the first or last item. Open, move through the items, wrapping; with Alt, Down opens the list and Up closes it.",
    },
    {
      keys: "Enter",
      action:
        "Adds the active item, or takes it out once selected, empties the text and keeps the list open. With no item active, closes the list, and a form submits.",
    },
    {
      keys: "Escape",
      action:
        "Closes the list and keeps the text. On a closed list, empties the text; the values stay.",
    },
    {
      keys: "Backspace",
      action:
        "In the empty input, focuses the last chip. On a chip, removes it and focuses the chip before it, else the next one, else the input.",
    },
    {
      keys: "Delete",
      action:
        "On a chip, removes it and focuses the chip after it, else the input.",
    },
    {
      keys: "Left Arrow, Right Arrow",
      action:
        "With the caret at the start of the text, Left focuses the last chip. On a chip, Left and Right move to the chip before or after it, and Right from the last chip to the input. Swapped right to left. Elsewhere they move the caret.",
    },
    {
      keys: "Tab, Shift + Tab",
      action:
        "Closes the list without adding and moves focus on; the text empties.",
    },
  ],
};
