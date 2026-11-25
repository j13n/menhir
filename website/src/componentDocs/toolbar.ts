import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const toolbarDoc: ComponentDoc = {
  slug: "toolbar",
  name: "Toolbar",
  category: "Inputs",
  description:
    "A row of controls, such as the buttons above a text editor, that is one tab stop, with arrow keys between them. Its items are buttons, links and text fields; a control of another component, such as a Toggle, a Toggle Group's item or a Menu's Trigger, joins as an item's render and keeps its own keys. It renders role=\"toolbar\", for three controls or more; name it with aria-label or aria-labelledby. A disabled item stays focusable, so a screen reader user finds it, and does nothing.",
  anatomy: tsx`<Toolbar.Root>
  <Toolbar.Button />
  <Toolbar.Link />
  <Toolbar.Input />
</Toolbar.Root>`,
  api: [
    {
      part: "Root",
      description:
        '<div role="toolbar">, with aria-orientation="vertical" when vertical, data-horizontal or data-vertical, and data-disabled. Separate its items with Separator.Root from menhir/separator, oriented across the toolbar.',
      props: [
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description:
            "Whether the items sit side by side, moved between with Left and Right, or stacked, moved between with Up and Down. The other pair of arrow keys stays with the controls, such as a Menu's Trigger, which opens on Down.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether every item ignores the user. They stay focusable.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the toolbar with your own component. Read once.",
        },
      ],
    },
    {
      part: "Button",
      description:
        '<button type="button">, with data-disabled. Through render it is a control of another component, such as render={Toggle.Root}, or render={Menu.Trigger} inside Menu.Root.',
      props: [
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            'Whether the button ignores the user: aria-disabled="true", so it stays focusable. Neither a click nor a key acts on it, nor on a control rendered through render.',
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the button as another component, which joins the toolbar. Read once.",
        },
      ],
    },
    {
      part: "Link",
      description: "<a>, with data-disabled. Give it href.",
      props: [
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            'Whether the link ignores the user: aria-disabled="true", and a click does not navigate.',
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the link with your own component. Read once.",
        },
      ],
    },
    {
      part: "Input",
      description:
        "<input>, with data-disabled. Name it with aria-label. It keeps Home and End, and the arrow keys while its caret can move that way: Left moves on only from the start, Right only from the end. Through render it is Input.Root.",
      props: [
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            'Whether the input ignores the user: aria-disabled="true" and readonly, so it stays focusable.',
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the input as another component, such as Input.Root. Read once.",
        },
      ],
    },
  ],
  keyboard: [
    {
      keys: "Tab",
      action:
        "Moves focus into the toolbar, to the item that last had focus or else the first that is not disabled, or out of it.",
    },
    {
      keys: "ArrowRight",
      action:
        "Moves focus to the next item, or the first from the last. Horizontal toolbars; the previous item in right-to-left text. In a text field, only from the end.",
    },
    {
      keys: "ArrowLeft",
      action:
        "Moves focus to the previous item, or the last from the first. Horizontal toolbars; the next item in right-to-left text. In a text field, only from the start.",
    },
    {
      keys: "ArrowDown",
      action:
        "Moves focus to the next item, or the first from the last. Vertical toolbars. In a horizontal one it is the control's, such as a Menu's Trigger opening.",
    },
    {
      keys: "ArrowUp",
      action:
        "Moves focus to the previous item, or the last from the first. Vertical toolbars.",
    },
    {
      keys: "Home",
      action: "Moves focus to the first item. In a text field, the caret.",
    },
    {
      keys: "End",
      action: "Moves focus to the last item. In a text field, the caret.",
    },
    {
      keys: "Space",
      action: "Activates the focused control, natively, unless disabled.",
    },
    {
      keys: "Enter",
      action: "Activates the focused control, natively, unless disabled.",
    },
  ],
  sections: [
    {
      id: "other-controls",
      title: "Controls of other components",
      text: "A control of another component joins the toolbar as an item's render, and keeps its own keys: a Toggle through render={Toggle.Root}; a Toggle Group's items each through a Toolbar.Button, whose arrow keys are then the toolbar's, while the group holds the value; a Menu's or a Select's Trigger, which opens on Down, Up, Enter and Space; Input.Root through Toolbar.Input. While a Select's list is open every key is the Select's. Put a text field last if you can, as the WAI-ARIA toolbar pattern advises. A Slider in a horizontal toolbar loses Left and Right to the toolbar and keeps Up and Down.",
    },
  ],
};
