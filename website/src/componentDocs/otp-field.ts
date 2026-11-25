import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const otpFieldDoc: ComponentDoc = {
  slug: "otp-field",
  name: "OTP Field",
  category: "Inputs",
  description:
    'A one-time code input for a verification code from a text message or email, shown as a box per digit or letter. The boxes are drawn from one real <input autocomplete="one-time-code">, invisible and laid over them, so the phone offers to fill the code from the message, a pasted code lands whole, and the form receives one value, which the browser validates. A press on a box selects its character, typing replaces it, and the arrow keys move between boxes.',
  anatomy: tsx`<OtpField.Root>
  <OtpField.Input />
  <OtpField.Slot index={0} />
  <OtpField.Slot index={1} />
</OtpField.Root>`,
  api: [
    {
      part: "Root",
      description:
        "A <div> around the parts, which holds the code, with position: relative so the Input lies over it. Its id, aria-describedby and aria-invalid go on the Input, so a <label for> its id names the Input, and it joins a Field as Field.Control's render. Every part has data-disabled, data-readonly and data-required.",
      props: [
        {
          name: "length",
          type: "number",
          description:
            "The number of characters in the code. Required. Render a Slot for each.",
        },
        {
          name: "value",
          type: "string",
          description:
            'The code, when controlled. Pair it with onValueChange. An empty code is "".',
        },
        {
          name: "defaultValue",
          type: "string",
          default: '""',
          description:
            "The code to start with, when uncontrolled. A form reset goes back to it.",
        },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          description:
            "Called with the new code on each edit, typed, pasted or filled by the phone, and on a form reset.",
        },
        {
          name: "onComplete",
          type: "(value: string) => void",
          description:
            "Called with the code once an edit of the user's fills the last box, after onValueChange and only if the field took it: the moment to verify the code or submit the form. Not for a value of yours.",
        },
        {
          name: "pattern",
          type: "string",
          default: '"[0-9]"',
          description:
            'A regular expression, as a string, that each character must match: "[0-9A-Za-z]" for letters and digits, "[0-9A-Z]" for upper case only. A character it refuses is tried in upper case, then in lower case, so "[0-9A-Z]" takes a typed a as A. Anything else is dropped from an edit, so a pasted 123-456 is 123456.',
        },
        {
          name: "name",
          type: "string",
          description: "The name the code is submitted under.",
        },
        {
          name: "required",
          type: "boolean",
          default: "false",
          description:
            "Whether the form can be submitted only with a code. A code that is not full is a pattern mismatch whether or not it is required.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether the field ignores the user, and the form submits nothing.",
        },
        {
          name: "readOnly",
          type: "boolean",
          default: "false",
          description:
            "Whether the code can be read and selected but not changed.",
        },
        {
          name: "form",
          type: "string",
          description:
            "The id of the form the code belongs to, when the field is not inside it.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the Root as another element. Read once.",
        },
      ],
    },
    {
      part: "Input",
      description:
        'The control: an <input type="text" autocomplete="one-time-code">, invisible (opacity: 0) and stretched over the Root, with the Root\'s name, required, disabled and a pattern attribute for the whole code, so the browser validates it. inputmode is numeric while the pattern takes digits only, else text. It has no focus ring of its own: show focus on the Slots with [data-active], or on the Root with :focus-within.',
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the input with your own component, which must render an <input>. Read once.",
        },
      ],
    },
    {
      part: "Slot",
      description:
        'A box: a <div aria-hidden="true"> with the character at its index, then its children. It has data-filled while it has a character, data-active while the Input has focus and the box is in its selection or holds its caret, and data-caret while the caret is in it: draw a caret there, such as a blinking line in an empty box.',
      props: [
        {
          name: "index",
          type: "number",
          description:
            "The box's place in the code, from 0. Required. Read once.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the box as another element. Read once.",
        },
      ],
    },
  ],
  keyboard: [
    {
      keys: "ArrowLeft",
      action: "Selects the box before. Right to left, the box after.",
    },
    {
      keys: "ArrowRight",
      action:
        "Selects the box after, up to the first empty one. Right to left, the box before.",
    },
    { keys: "Home", action: "Selects the first box." },
    {
      keys: "End",
      action:
        "Puts the caret in the first empty box, or selects the last of a full code.",
    },
    {
      keys: "Backspace",
      action:
        "Deletes the selected character, or the one before the caret. The characters after it move back a box.",
    },
    {
      keys: "Delete",
      action: "Deletes the selected character, or the one after the caret.",
    },
    {
      keys: "Enter",
      action:
        "Submits the form, as in any text field: a form whose only text field it is needs no submit button.",
    },
  ],
  sections: [
    {
      id: "letters-and-digits",
      title: "Letters and digits",
      text: 'pattern decides which characters a box takes, as the native pattern attribute does: "[0-9]" by default, "[0-9A-Z]" for a code in upper case, which takes a lower-case letter as upper case. With letters in the pattern, the phone shows its text keyboard (inputmode="text"). Group the boxes with any element between them, such as a dash with aria-hidden="true"; a press on it selects the nearest box.',
    },
    {
      id: "in-a-field",
      title: "In a Field",
      text: "An OTP Field joins a Field as Field.Control's render, with the Root as the Control: the Root hands the Field's id, description and aria-invalid to the Input, so the Label names it, and its name, required and disabled reach the Input. The Field reads the Input's validity: with required, an empty code shows an error once touched, and a code that is not full shows a pattern mismatch, for which Field.Error match=\"patternMismatch\" gives your own words. Put the Input and the Slots inside Field.Control, which passes its children to the Root.",
    },
  ],
};
