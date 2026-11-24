import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const switchDoc: ComponentDoc = {
  slug: "switch",
  name: "Switch",
  category: "Inputs",
  description:
    "A control that turns a setting on or off. It renders a native button with the switch role, and a hidden checkbox beside it so that forms submit its value.",
  anatomy: tsx`<Switch.Root>
  <Switch.Thumb />
</Switch.Root>`,
  api: [
    {
      part: "Root",
      description:
        'The switch: a <button role="switch">, followed by a visually hidden <input type="checkbox"> for forms. Label it with a <label> around it or one whose for matches its id, or put it in a Field (In a Field, below). Its render function must render a <button>.',
      props: [
        {
          name: "checked",
          type: "boolean",
          description:
            "Whether the switch is on, when controlled. Pair it with onCheckedChange.",
        },
        {
          name: "defaultChecked",
          type: "boolean",
          default: "false",
          description:
            "Whether the switch starts on, when uncontrolled. A form reset goes back to it.",
        },
        {
          name: "onCheckedChange",
          type: "(checked: boolean) => void",
          description:
            "Called with the new value when the user turns the switch on or off, or the form is reset. A controlled switch changes only if checked does.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether the switch ignores the user. It cannot be focused, and the form does not submit it.",
        },
        {
          name: "readOnly",
          type: "boolean",
          default: "false",
          description:
            "Whether the switch can be focused but not turned on or off.",
        },
        {
          name: "required",
          type: "boolean",
          default: "false",
          description:
            "Whether the form can be submitted only while the switch is on.",
        },
        {
          name: "name",
          type: "string",
          description: "The name the form submits the switch under.",
        },
        {
          name: "value",
          type: "string",
          default: '"on"',
          description: "What the form submits while the switch is on.",
        },
        {
          name: "form",
          type: "string",
          description:
            "The id of the form the switch belongs to, when it is not inside it.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the switch with your own button component. Read once.",
        },
      ],
    },
    {
      part: "Thumb",
      description:
        "The part that slides between off and on: a <span>. Place it inside Root.",
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the thumb with your own component.",
        },
      ],
    },
  ],
  keyboard: [
    { keys: "Space", action: "Turns the switch on or off." },
    { keys: "Enter", action: "Turns the switch on or off." },
    { keys: "Tab", action: "Moves focus to or away from the switch." },
  ],
  sections: [
    {
      id: "in-a-field",
      title: "In a Field",
      text: "A Switch joins a Field as Field.Control's render: the Field gives the button its id, label, description and error, and the hidden input its name. A required Switch that is off shows its error once the user has left it, turned it off again or tried to submit the form, and when the browser blocks the submission, focus moves to the switch. The Field's data-invalid and data-touched are on the button; style the Thumb through it, as in [data-invalid] .thumb. For a controlled Switch, render it with a function and put checked and onCheckedChange on it, as the Checkbox page shows. A Switch outside a Field costs nothing more.",
    },
  ],
};
