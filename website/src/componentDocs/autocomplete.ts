import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

// `what` finishes "Renders the …".
const render = (what: string) => ({
  name: "render",
  type: "(props) => JSX.Element",
  description: `Renders the ${what}. Read once.`,
});

export const autocompleteDoc: ComponentDoc = {
  slug: "autocomplete",
  name: "Autocomplete",
  description:
    'A text input with suggestions: the WAI-ARIA combobox pattern, with list autocomplete and manual selection. A Combobox picks a value from a list; an Autocomplete is free text with suggestions, such as a search or a city. Its value is the text: typing opens the list and you filter it, by rendering the suggestions that match, with includesText, a separate import that ignores case and accents, or your own search, on the server too. Focus stays in the input, which names the active suggestion in aria-activedescendant: Down and Up move through the suggestions, Enter puts the active one in the input, Escape closes the list and, once it is closed, empties the input. Text that matches no suggestion is kept when focus leaves. The input is the form control itself: it submits the text under name, blocks a submission while required and empty, and follows a form reset. It builds on Combobox: Trigger, Clear, Popup, List, Group, GroupLabel and Status are Combobox\'s parts, so an app that uses both pays for them once. The Popup is a popover="manual" element, so the browser puts it in the top layer, above every z-index; there is no portal. Menhir places it with Floating UI, below the Input and aligned to its start, and writes --anchor-width and --available-height on it. Name the Autocomplete with a <label> for the Input, and the List with aria-labelledby.',
  anatomy: tsx`<label for="city" id="city-label" />
<Autocomplete.Root>
  <Autocomplete.Input id="city" />
  <Autocomplete.Trigger />
  <Autocomplete.Clear />
  <Autocomplete.Popup>
    <Autocomplete.List aria-labelledby="city-label">
      <Autocomplete.Item />
      <Autocomplete.Group>
        <Autocomplete.GroupLabel />
        <Autocomplete.Item />
      </Autocomplete.Group>
    </Autocomplete.List>
    <Autocomplete.Status />
  </Autocomplete.Popup>
</Autocomplete.Root>`,
  api: [
    {
      part: "Root",
      description:
        "Holds the text, which is the value, and the open state, and renders no element. The Input, the Trigger and the Popup have data-open or data-closed, data-disabled and data-required.",
      props: [
        {
          name: "value",
          type: "string",
          description:
            "The text in the input, when controlled. Pair it with onValueChange.",
        },
        {
          name: "defaultValue",
          type: "string",
          default: '""',
          description:
            "The text at first, when uncontrolled. The server HTML shows it, and a form reset goes back to it.",
        },
        {
          name: "onValueChange",
          type: "(text: string, details: { reason, event }) => void",
          description:
            'Called with the new text, and why: "input-change" (the user typed), "item-press" (a suggestion was accepted, and the text is its value), "escape-key" or "clear-press" (emptied) or "reset". Filter by the text for "input-change" only, and show every suggestion otherwise, so the list shows them all after one is accepted. A controlled Autocomplete changes only if value does.',
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
            'Called with the new value when the user opens or closes the list, and why: "input-change" (typing opened it), "arrow-key" (Down, Up, Alt + Down or Alt + Up), "trigger-press", "item-press" (a suggestion was accepted), "enter-key" (Enter with no suggestion active), "escape-key" or "focus-out" (focus left the input, as a press outside does). A controlled Autocomplete changes only if open does.',
        },
        {
          name: "name",
          type: "string",
          description: "The name the text is submitted under, with the form.",
        },
        {
          name: "form",
          type: "string",
          description:
            "The id of the form the Autocomplete belongs to, when it is not inside it.",
        },
        {
          name: "required",
          type: "boolean",
          description:
            "Whether the form can be submitted only with some text, which the browser checks on the Input.",
        },
        {
          name: "disabled",
          type: "boolean",
          description:
            "Whether the Autocomplete ignores the user: the Input and the buttons are disabled, and the text is not submitted.",
        },
      ],
    },
    {
      part: "Input",
      description:
        '<input type="text" role="combobox" aria-autocomplete="list" autocomplete="off"> with aria-expanded, with aria-controls naming the List, and with aria-activedescendant naming the active suggestion. It keeps focus while the list is open. It is the form control: it takes name, form, required and disabled from the Root. Takes your id, for a <label for>.',
      props: [
        {
          name: "autocomplete",
          type: "string",
          default: '"off"',
          description:
            "What the browser may suggest. Off by default, so its own list does not cover the Autocomplete's.",
        },
        render("input with your own component"),
      ],
    },
    {
      part: "Trigger",
      description:
        'Combobox\'s Trigger: a <button type="button" tabindex="-1"> that opens and closes the list and focuses the input, with aria-expanded and aria-controls naming the List. Name it with aria-label. Its render function must render a <button>.',
      props: [render("trigger with your own button component")],
    },
    {
      part: "Clear",
      description:
        'Combobox\'s Clear: a <button type="button" tabindex="-1"> that empties the text and focuses the input, as Escape on a closed list does. Name it with aria-label. Its render function must render a <button>.',
      props: [render("button with your own button component")],
    },
    {
      part: "Popup",
      description:
        "Combobox's Popup: a <div popover=\"manual\">, placed against the Input, around the List and the Status, with side, align, sideOffset, alignOffset, collisionPadding and anchor as on Combobox's page. It takes no focus, and a press in it moves none. It has the CSS variables --anchor-width and --available-height.",
      props: [render("popup with your own component")],
    },
    {
      part: "List",
      description:
        "Combobox's List: a <div role=\"listbox\"> around the suggestions, with a generated id for the Input to name. Name it with aria-labelledby, such as the id of the input's <label>, or aria-label.",
      props: [render("list with your own component")],
    },
    {
      part: "Item",
      description:
        '<div role="option">, a suggestion, with aria-selected="true" and data-active while it is the active one, and no aria-selected otherwise: there is no selected item, only the text. A click puts its value in the input and closes the list. Takes your id, else a generated one. Render the suggestions that match the text.',
      props: [
        {
          name: "value",
          type: "string",
          description:
            "The text it puts in the input when accepted. Its content may differ, such as an icon or a highlighted match.",
        },
        {
          name: "disabled",
          type: "boolean",
          description:
            "Whether it is disabled: the keys and the pointer still reach it, but it is not accepted.",
        },
        render("item with your own component"),
      ],
    },
    {
      part: "Group",
      description:
        'Combobox\'s Group: a <div role="group"> for suggestions that belong together, named by its GroupLabel.',
      props: [render("group with your own component")],
    },
    {
      part: "GroupLabel",
      description:
        "Combobox's GroupLabel: a <div> that names its Group. The keys do not reach it.",
      props: [render("label with your own component")],
    },
    {
      part: "Status",
      description:
        'Combobox\'s Status: a <div role="status">, a polite live region, with what its function returns for the number of suggestions while the list is open, and nothing while it is closed. Beside the List, it is the message for no suggestions; visually hidden beside the Input, it tells a screen reader how many match.',
      props: [
        {
          name: "children",
          type: "(count: number) => JSX.Element",
          description:
            'What it says for the number of suggestions, such as (count) => count === 0 && "No suggestions". Menhir writes no text of its own.',
        },
        render("status with your own component"),
      ],
    },
  ],
  keyboard: [
    {
      keys: "A character",
      action:
        "Types it and opens the list, with no suggestion active: filter the suggestions by the text.",
    },
    {
      keys: "Down Arrow",
      action:
        "Closed, opens the list on the first suggestion; with Alt, opens it with none active. Open, moves to the next suggestion, and from the last to the first.",
    },
    {
      keys: "Up Arrow",
      action:
        "Closed, opens the list on the last suggestion. Open, moves to the previous one, and from the first to the last; with Alt, closes the list.",
    },
    {
      keys: "Enter",
      action:
        "Puts the active suggestion in the input and closes the list. With none active, closes the list, and a form submits.",
    },
    {
      keys: "Escape",
      action:
        "Closes the list and keeps the text. On a closed list, empties the text.",
    },
    {
      keys: "Home, End, Left Arrow, Right Arrow",
      action: "Move the caret in the text, as in any text input.",
    },
    {
      keys: "Tab, Shift + Tab",
      action: "Closes the list, keeps the text and moves focus on.",
    },
  ],
};
