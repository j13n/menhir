import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const collapsibleDoc: ComponentDoc = {
  slug: "collapsible",
  name: "Collapsible",
  category: "Disclosure",
  summary:
    "A button that shows and hides a section of content, such as the answer under a question.",
  description:
    "A button that shows and hides a section of content, such as the answer under a question or the details of an order: the WAI-ARIA disclosure pattern. The Trigger is a native button with aria-expanded, and aria-controls naming the Panel. A closed Panel has the hidden attribute, so its content stays in the page, keeping its state, but is not shown or read out; to leave closed content out of the page, wrap it in <Show>.",
  anatomy: tsx`<Collapsible.Root>
  <Collapsible.Trigger />
  <Collapsible.Panel />
</Collapsible.Root>`,
  api: [
    {
      part: "Root",
      description:
        "<div> that holds the open state. Every part has data-open or data-closed, and data-disabled.",
      props: [
        {
          name: "open",
          type: "boolean",
          description:
            "Whether the Panel is shown, when controlled. Pair it with onOpenChange.",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description:
            "Whether the Panel is shown at first, when uncontrolled.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description:
            "Called with the new value when the user shows or hides the Panel. A controlled Panel changes only if open does.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether the Trigger ignores the user. It cannot be focused either; the Panel stays as it is.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the root with your own component. Read once.",
        },
      ],
    },
    {
      part: "Trigger",
      description:
        '<button type="button" aria-expanded aria-controls>. Name it with its content. Its render function must render a <button>.',
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
        "<div>, hidden while closed. Its id is generated, so that the Trigger can name it in the server's HTML too, and it takes no id of its own: for a link target, give the id to an element inside it.",
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
    { keys: "Space", action: "Shows or hides the Panel." },
    { keys: "Enter", action: "Shows or hides the Panel." },
    { keys: "Tab", action: "Moves focus to or away from the Trigger." },
  ],
};
