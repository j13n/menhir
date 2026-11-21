import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const tabsDoc: ComponentDoc = {
  slug: "tabs",
  name: "Tabs",
  description:
    "Layered sections of content, one shown at a time, each chosen by its tab: the WAI-ARIA tabs pattern. The List is one tab stop, and arrow keys move between the tabs. By default a tab is selected as it receives focus; with manual activation, by click, Enter or Space. A Panel that is not selected has the hidden attribute, so its content stays in the page, keeping its state, but is not shown or read out.",
  anatomy: tsx`<Tabs.Root>
  <Tabs.List>
    <Tabs.Tab />
  </Tabs.List>
  <Tabs.Panel />
</Tabs.Root>`,
  api: [
    {
      part: "Root",
      description:
        "<div> that holds which tab is selected. It has data-horizontal or data-vertical.",
      props: [
        {
          name: "value",
          type: "string | null",
          description:
            "The selected tab's value, when controlled; null selects none. Pair it with onValueChange.",
        },
        {
          name: "defaultValue",
          type: "string",
          description:
            "The value of the tab selected at first, when uncontrolled. Without one, the first enabled tab is selected.",
        },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          description:
            "Called with the new value when the user selects a tab. A controlled Root changes only if value does.",
        },
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description:
            "Whether the tabs are side by side, moved between with Left and Right, or stacked, with Up and Down.",
        },
        {
          name: "activation",
          type: '"automatic" | "manual"',
          default: '"automatic"',
          description:
            "Whether a tab is selected when it receives focus, or only by click, Enter or Space. Choose manual when a Panel takes time to show, such as one that fetches its content.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the root with your own component. Read once.",
        },
      ],
    },
    {
      part: "List",
      description:
        '<div role="tablist">, one tab stop: Tab into it focuses the selected tab. Name it with aria-label or aria-labelledby. It has aria-orientation="vertical" when vertical, and data-horizontal or data-vertical.',
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the list with your own component. Read once.",
        },
      ],
    },
    {
      part: "Tab",
      description:
        '<button type="button" role="tab" aria-selected aria-controls>, with data-selected or data-unselected, and data-disabled. Name it with its content. Its id is generated unless you give one. Its render function must render a <button>.',
      props: [
        {
          name: "value",
          type: "string",
          description:
            "Identifies the tab in the Root's value, and its Panel. It is part of both ids, so it must not contain spaces.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether the tab cannot be selected. It stays focusable, with aria-disabled, so that keyboard and screen-reader users still find it.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the tab with your own button component. Read once.",
        },
      ],
    },
    {
      part: "Panel",
      description:
        '<div role="tabpanel"> named by its tab, hidden unless the tab is selected, with data-selected or data-unselected. It is a tab stop, for content with nothing focusable; when its content starts with a focusable element, pass tabindex={undefined}. Its id is generated, so that the tab can name it in the server\'s HTML too, and it takes no id of its own.',
      props: [
        {
          name: "value",
          type: "string",
          description: "The value of the tab that shows this Panel.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the panel with your own component. Read once.",
        },
      ],
    },
  ],
  keyboard: [
    {
      keys: "Tab",
      action:
        "Moves focus into the List, to the selected tab, or from the List to the selected Panel.",
    },
    {
      keys: "ArrowRight",
      action:
        "Moves focus to the next tab, or the first from the last. Horizontal lists; the previous tab in right-to-left text.",
    },
    {
      keys: "ArrowLeft",
      action:
        "Moves focus to the previous tab, or the last from the first. Horizontal lists; the next tab in right-to-left text.",
    },
    {
      keys: "ArrowDown",
      action:
        "Moves focus to the next tab, or the first from the last. Vertical lists.",
    },
    {
      keys: "ArrowUp",
      action:
        "Moves focus to the previous tab, or the last from the first. Vertical lists.",
    },
    { keys: "Home", action: "Moves focus to the first tab." },
    { keys: "End", action: "Moves focus to the last tab." },
    {
      keys: "Space",
      action:
        "Selects the focused tab. With automatic activation, focus has already selected it.",
    },
    {
      keys: "Enter",
      action:
        "Selects the focused tab. With automatic activation, focus has already selected it.",
    },
  ],
};
