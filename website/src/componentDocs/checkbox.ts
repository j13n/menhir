import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const checkboxDoc: ComponentDoc = {
  slug: "checkbox",
  name: "Checkbox",
  description:
    "A control that the user checks or unchecks, with an optional partly checked state. It renders a native button with the checkbox role, and a hidden checkbox beside it so that forms submit its value.",
  anatomy: tsx`<Checkbox.Root>
  <Checkbox.Indicator />
</Checkbox.Root>`,
  api: [
    {
      part: "Root",
      description:
        'The checkbox: a <button role="checkbox">, followed by a visually hidden <input type="checkbox"> for forms. Label it with a <label> around it or one whose for matches its id. Its render function must render a <button>.',
      props: [
        {
          name: "checked",
          type: "boolean",
          description:
            "Whether the checkbox is checked, when controlled. Pair it with onCheckedChange.",
        },
        {
          name: "defaultChecked",
          type: "boolean",
          default: "false",
          description:
            "Whether the checkbox starts checked, when uncontrolled. A form reset goes back to it.",
        },
        {
          name: "onCheckedChange",
          type: "(checked: boolean) => void",
          description:
            "Called with the new value when the user checks or unchecks the checkbox, or the form is reset. A controlled checkbox changes only if checked does.",
        },
        {
          name: "indeterminate",
          type: "boolean",
          default: "false",
          description:
            'Whether the checkbox is partly checked, such as the parent of a group whose children are only some checked. Its aria-checked is "mixed". A click still asks for the opposite of checked, so a mixed checkbox that is not checked asks to be checked.',
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether the checkbox ignores the user. It cannot be focused, and the form does not submit it.",
        },
        {
          name: "readOnly",
          type: "boolean",
          default: "false",
          description:
            "Whether the checkbox can be focused but not checked or unchecked.",
        },
        {
          name: "required",
          type: "boolean",
          default: "false",
          description:
            "Whether the form can be submitted only while the checkbox is checked.",
        },
        {
          name: "name",
          type: "string",
          description: "The name the form submits the checkbox under.",
        },
        {
          name: "value",
          type: "string",
          default: '"on"',
          description: "What the form submits while the checkbox is checked.",
        },
        {
          name: "form",
          type: "string",
          description:
            "The id of the form the checkbox belongs to, when it is not inside it.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the checkbox with your own button component. Read once.",
        },
      ],
    },
    {
      part: "Indicator",
      description:
        "The check mark: a <span>, always rendered, with the same data attributes as Root (data-checked, data-unchecked or data-indeterminate) so that your CSS shows it. Place it inside Root.",
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the indicator with your own component.",
        },
      ],
    },
  ],
  keyboard: [
    { keys: "Space", action: "Checks or unchecks the checkbox." },
    { keys: "Tab", action: "Moves focus to or away from the checkbox." },
  ],
};
