import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const toggleGroupDoc: ComponentDoc = {
  slug: "toggle-group",
  name: "Toggle Group",
  category: "Inputs",
  description:
    'A set of toggle buttons that share one value, such as the text alignment buttons of an editor. By default one item is pressed at a time; with multiple, each item presses on its own. The group is one tab stop: arrow keys move focus between its items, and Enter or Space presses one. It renders role="group"; name it with aria-label or aria-labelledby. A group that is a whole toolbar, of three controls or more, passes role="toolbar", and then also gets aria-orientation when vertical.',
  anatomy: tsx`<ToggleGroup.Root>
  <ToggleGroup.Item />
</ToggleGroup.Root>`,
  api: [
    {
      part: "Root",
      description:
        '<div role="group">, with data-horizontal or data-vertical, and data-disabled.',
      props: [
        {
          name: "value",
          type: "string[]",
          description:
            "The values of the pressed items, when controlled. Pair it with onValueChange. Nothing pressed is [].",
        },
        {
          name: "defaultValue",
          type: "string[]",
          default: "[]",
          description:
            "The values of the items pressed at first, when uncontrolled.",
        },
        {
          name: "onValueChange",
          type: "(value: string[]) => void",
          description:
            "Called with the new values when the user presses or releases an item. A controlled group changes only if value does.",
        },
        {
          name: "multiple",
          type: "boolean",
          default: "false",
          description:
            "Whether several items can be pressed at once. Otherwise pressing an item releases the one pressed before.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether every item ignores the user. They cannot be focused either.",
        },
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description:
            "Whether the items sit side by side, moved between with Left and Right, or stacked, moved between with Up and Down.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the group with your own component. Read once.",
        },
      ],
    },
    {
      part: "Item",
      description:
        '<button type="button" aria-pressed>, with data-pressed or data-unpressed, and data-disabled. Name it with its content, or with aria-label when it shows only an icon. Its render function must render a <button>.',
      props: [
        {
          name: "value",
          type: "string",
          description: "Identifies the item in the group's value. Required.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether the item ignores the user. Arrow keys skip it.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the item with your own button component. Read once.",
        },
      ],
    },
  ],
  keyboard: [
    {
      keys: "Tab",
      action:
        "Moves focus into the group, to the item that last had focus or else the first, or out of it.",
    },
    {
      keys: "ArrowRight",
      action:
        "Moves focus to the next item, or the first from the last. Horizontal groups; the previous item in right-to-left text.",
    },
    {
      keys: "ArrowLeft",
      action:
        "Moves focus to the previous item, or the last from the first. Horizontal groups; the next item in right-to-left text.",
    },
    {
      keys: "ArrowDown",
      action:
        "Moves focus to the next item, or the first from the last. Vertical groups.",
    },
    {
      keys: "ArrowUp",
      action:
        "Moves focus to the previous item, or the last from the first. Vertical groups.",
    },
    { keys: "Home", action: "Moves focus to the first item." },
    { keys: "End", action: "Moves focus to the last item." },
    { keys: "Space", action: "Presses or releases the focused item." },
    { keys: "Enter", action: "Presses or releases the focused item." },
  ],
};
