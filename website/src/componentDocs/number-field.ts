import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const numberFieldDoc: ComponentDoc = {
  slug: "number-field",
  name: "Number Field",
  category: "Inputs",
  description:
    'A number input with buttons that step it up and down, formatted for the user\'s locale. The user types in an <input type="text" role="spinbutton"> that shows the number with Intl.NumberFormat, such as 1.234,50 € in German, and reads typed text back in the same language when focus leaves it or Enter is pressed. The arrow keys, Page Up, Page Down, Home and End step it, and the buttons repeat while held. The form receives the plain number, such as 1234.5, from a hidden number input, which the browser validates against min, max, step and required.',
  anatomy: tsx`<NumberField.Root>
  <NumberField.Decrement />
  <NumberField.Input />
  <NumberField.Increment />
</NumberField.Root>`,
  api: [
    {
      part: "Root",
      description:
        'A <div> around the parts, which holds the value, then a visually hidden <input type="number"> with the plain number for the form. Its id, aria-describedby and aria-invalid go on the Input, so a <label for> its id names the Input, and it joins a Field as Field.Control\'s render. Every part has data-disabled, data-readonly and data-required.',
      props: [
        {
          name: "value",
          type: "number | null",
          description:
            "The number, when controlled. Pair it with onValueChange. An empty field is null.",
        },
        {
          name: "defaultValue",
          type: "number | null",
          default: "null",
          description:
            "The number to start with, when uncontrolled. A form reset goes back to it.",
        },
        {
          name: "onValueChange",
          type: "(value: number | null) => void",
          description:
            "Called with the new number when the user commits typed text, steps it with a key or a button, or resets the form. Not on each key: typed text is read when focus leaves the Input or Enter is pressed.",
        },
        {
          name: "min",
          type: "number",
          description:
            "The lowest number the user can set: typed numbers and steps are clamped to it, Home sets it, and Decrement is disabled there. A value from you below it is shown, and the browser reports it.",
        },
        {
          name: "max",
          type: "number",
          description:
            "The highest number the user can set: typed numbers and steps are clamped to it, End sets it, and Increment is disabled there.",
        },
        {
          name: "step",
          type: "number",
          default: "1",
          description:
            "How much Up, Down and the buttons change the number. Steps land on multiples of step counted from min, else from 0. When you set step, a typed number off it is kept, and the browser reports it as a step mismatch; without one, any typed number is valid.",
        },
        {
          name: "largeStep",
          type: "number",
          default: "step × 10",
          description: "How much Page Up and Page Down change the number.",
        },
        {
          name: "format",
          type: "Intl.NumberFormatOptions",
          description:
            'How the Input shows the number, such as { style: "currency", currency: "EUR" } or { style: "percent" }, where 0.25 shows as 25%. Typed text is read back in the same format, and a typed number is rounded to the digits it shows.',
        },
        {
          name: "locale",
          type: "Intl.LocalesArgument",
          description:
            "The language to format and read the number in, else the browser's. Pass it when rendering on the server, so that the server and the browser agree.",
        },
        {
          name: "name",
          type: "string",
          description: "The name the plain number is submitted under.",
        },
        {
          name: "required",
          type: "boolean",
          default: "false",
          description:
            "Whether the form can be submitted only with a number. The browser blocks the submission and focuses the Input.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether every part ignores the user, and the form submits nothing.",
        },
        {
          name: "readOnly",
          type: "boolean",
          default: "false",
          description:
            "Whether the number can be read and selected but not changed. The buttons are disabled.",
        },
        {
          name: "form",
          type: "string",
          description:
            "The id of the form the number belongs to, when the field is not inside it.",
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
        'The spinbutton: an <input type="text" role="spinbutton" inputmode="decimal" autocomplete="off"> with aria-valuenow, aria-valuemin, aria-valuemax and aria-valuetext. It shows the number formatted, keeps text as the user types it, and reads it back on blur and on Enter: text that is not a number goes back to the number before. Pass inputmode="numeric" for whole numbers, or "text" where a minus sign must be typed on iOS, whose decimal pad has none.',
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
      part: "Increment",
      description:
        'A <button type="button" tabindex="-1"> that increases the number by step, and repeats while held. It is out of the tab order, since the arrow keys do the same, keeps focus on the Input, and is disabled at max. It has no name of its own: give it aria-label or text, such as aria-label="Increase".',
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the button with your own component, which must render a <button>. Read once.",
        },
      ],
    },
    {
      part: "Decrement",
      description:
        'A <button type="button" tabindex="-1"> that decreases the number by step, and repeats while held, disabled at min. Give it a name, such as aria-label="Decrease".',
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the button with your own component, which must render a <button>. Read once.",
        },
      ],
    },
  ],
  keyboard: [
    { keys: "ArrowUp", action: "Increases the number by step." },
    { keys: "ArrowDown", action: "Decreases the number by step." },
    { keys: "PageUp", action: "Increases the number by largeStep." },
    { keys: "PageDown", action: "Decreases the number by largeStep." },
    {
      keys: "Home",
      action: "Sets the number to min, if set; otherwise moves the caret.",
    },
    {
      keys: "End",
      action: "Sets the number to max, if set; otherwise moves the caret.",
    },
    {
      keys: "Enter",
      action:
        "Reads the typed text as the number, then submits the form as usual.",
    },
  ],
  sections: [
    {
      id: "in-a-field",
      title: "In a Field",
      text: "A Number Field joins a Field as Field.Control's render, with the Root as the Control: the Root hands the Field's id, description and aria-invalid to the Input, so the Label names it, and its name, required and disabled reach the hidden input and every part. The Field reads the hidden input's validity: with required, an empty field shows an error once touched, and a typed number off the step shows the browser's step mismatch message. Typed numbers are clamped to min and max, so only a value of yours can be out of range. Put the Input and the buttons inside Field.Control, which passes its children to the Root.",
    },
  ],
};
