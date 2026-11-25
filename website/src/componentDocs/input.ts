import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const inputDoc: ComponentDoc = {
  slug: "input",
  name: "Input",
  category: "Inputs",
  description:
    "A text input whose value you can control: a native <input> with value, defaultValue and onValueChange. Controlled, it shows your value and nothing else: an edit you decline is undone, a form reset asks you, and nothing is written while an input method composes. Uncontrolled, the value stays in the input, and a reset puts defaultValue back. In a form it submits its text under its name, and the browser validates it.",
  anatomy: tsx`<Input.Root />`,
  api: [
    {
      part: "Root",
      description:
        "The input: an <input> that takes every attribute of one, such as name, type, required, placeholder or autocomplete. It is for text: text, email, password, search, tel, url and the date and time types. It has no data-* attributes of its own: style it with :disabled, :read-only, :placeholder-shown or :user-invalid, or the data-* attributes of a Field around it.",
      props: [
        {
          name: "value",
          type: "string",
          description:
            "The text, when controlled. After each edit the input shows it again, so an edit you decline is undone.",
        },
        {
          name: "defaultValue",
          type: "string",
          default: '""',
          description:
            "The text to start with, when uncontrolled, and the text a form reset puts back.",
        },
        {
          name: "onValueChange",
          type: '(value: string, details: { reason: "input-change" | "reset"; event: Event }) => void',
          description:
            "Called with the new text on each edit, and with defaultValue on a form reset. onInput and onChange are the browser's events, and run as well.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the input as another element, with the same value props: render={(props) => <textarea {...props} />}. Read once.",
        },
      ],
    },
  ],
  keyboard: [
    {
      keys: "Tab",
      action:
        "Moves focus to the input and away from it. Every other key edits the text as the browser does; Input adds none.",
    },
  ],
  sections: [
    {
      id: "in-a-field",
      title: "In a Field",
      text: "An Input joins a Field as Field.Control's render, like any control: the Field gives it its id, name, label, description and error, and the value props go on the Input. A Field reads nothing from the Input, so an Input outside a Field costs nothing more.",
    },
    {
      id: "one-time-code",
      title: "One-time code",
      text: 'A code sent by text message or email is one input with autocomplete="one-time-code", which phones offer to fill from the message, inputmode="numeric" for a number pad, and maxlength and pattern for its length. A pasted code lands in it whole. For a box per digit, use OTP Field, which draws the boxes from one such input.',
    },
  ],
};
