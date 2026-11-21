import type { ComponentDoc } from "./types";

export const accordionDoc: ComponentDoc = {
  slug: "accordion",
  name: "Accordion",
  description:
    "A stack of headings, each a button that shows and hides its own section, such as the questions of an FAQ: the WAI-ARIA accordion pattern. Each Trigger is a native button with aria-expanded, inside a heading, and each Panel is a region named by its Trigger. By default one section is open at a time; with multiple, each opens on its own. A closed Panel has the hidden attribute, so its content stays in the page, keeping its state, but is not shown or read out.",
  anatomy: `<Accordion.Root>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger />
    </Accordion.Header>
    <Accordion.Panel />
  </Accordion.Item>
</Accordion.Root>`,
  api: [
    {
      part: "Root",
      description:
        "<div> that holds which sections are open. It has data-disabled when disabled.",
      props: [
        {
          name: "value",
          type: "string[]",
          description:
            "The values of the open Items, when controlled. Pair it with onValueChange.",
        },
        {
          name: "defaultValue",
          type: "string[]",
          default: "[]",
          description:
            "The values of the Items open at first, when uncontrolled.",
        },
        {
          name: "onValueChange",
          type: "(value: string[]) => void",
          description:
            "Called with the new values when the user opens or closes a section. A controlled accordion changes only if value does.",
        },
        {
          name: "multiple",
          type: "boolean",
          default: "false",
          description:
            "Whether several sections can be open at once. Otherwise opening one closes the one open before.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether every Trigger ignores the user. They cannot be focused either; the Panels stay as they are.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the root with your own component. Read once.",
        },
      ],
    },
    {
      part: "Item",
      description:
        "<div> around one section. Each part of an Item has data-open or data-closed, and data-disabled.",
      props: [
        {
          name: "value",
          type: "string",
          description:
            "Identifies the section in the Root's value. Without one, the Item uses a generated value, enough for an uncontrolled accordion that starts closed.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether this section's Trigger ignores the user. It cannot be focused either.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the item with your own component. Read once.",
        },
      ],
    },
    {
      part: "Header",
      description:
        "<h3> that holds only the Trigger. For the heading level that fits your page, render another heading: render={(props) => <h2 {...props} />}.",
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the header with your own heading. Read once.",
        },
      ],
    },
    {
      part: "Trigger",
      description:
        '<button type="button" aria-expanded aria-controls>. Name it with its content. Its id is generated unless you give one. Its render function must render a <button>.',
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the trigger with your own button component. Read once.",
        },
      ],
    },
    {
      part: "Panel",
      description:
        '<div role="region"> named by its Trigger, hidden while closed. Its id is generated, so that the Trigger can name it in the server\'s HTML too, and it takes no id of its own. Where many sections can be open at once, about six or more, leave the regions out: render={(props) => <div {...props} role={undefined} aria-labelledby={undefined} />}.',
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the panel with your own component. Read once.",
        },
      ],
    },
  ],
  keyboard: [
    { keys: "Space", action: "Shows or hides the focused Trigger's section." },
    { keys: "Enter", action: "Shows or hides the focused Trigger's section." },
    {
      keys: "Tab",
      action: "Moves focus to the next Trigger, or the next focusable element.",
    },
    {
      keys: "Shift + Tab",
      action:
        "Moves focus to the previous Trigger, or the previous focusable element.",
    },
  ],
};
