import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const fieldDoc: ComponentDoc = {
  slug: "field",
  name: "Field",
  description:
    "A form field: the label, description and error message of a form control, and its validation state. It reads the browser's constraint validation and takes errors from outside, such as a server's or a schema's, and shows an error only once the field was touched. It holds no value: the value stays in the control or in your app.",
  anatomy: tsx`<Field.Root>
  <Field.Label />
  <Field.Control />
  <Field.Description />
  <Field.Error />
</Field.Root>`,
  api: [
    {
      part: "Root",
      description:
        "The field: a <div> around the parts. It tracks whether the field was touched: once focus has left it, once its control has changed, or once a submission of its form was attempted; a form reset clears it. Every part gets data-touched once touched, data-invalid while the field shows an error, and data-disabled.",
      props: [
        {
          name: "name",
          type: "string",
          description: "The control's name, which the form submits it under.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether the control is disabled.",
        },
        {
          name: "error",
          type: "string",
          description:
            "An error message from outside, such as a server's answer or a schema's issue, which makes the field invalid. It shows once the field was touched, over the browser's message, and does not block a submission.",
        },
        {
          name: "invalid",
          type: "boolean",
          default: "false",
          description:
            "Whether the field is invalid from outside, with no message of its own: write the message as the Error's children.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the field with your own component. Read once.",
        },
      ],
    },
    {
      part: "Label",
      description:
        "The control's label: a <label> whose for is the control's id, so it names the control before hydration.",
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the label with your own component. Read once.",
        },
      ],
    },
    {
      part: "Control",
      description:
        "The control: an <input> with the field's id, name and disabled, aria-describedby naming the Description and the rendered Error, and aria-invalid=\"true\" while the field shows an error. It takes the input's own attributes, such as type, required or pattern, which the browser validates. It takes no id: the Root generates it.",
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the control as a <textarea>, a <select> or another component, which gets the same attributes: render={(props) => <textarea {...props} />}, render={Switch.Root}, or render={Select.Trigger} inside Select.Root, which keeps its own name, required and disabled. Children go through, such as a Switch's Thumb. Read once.",
        },
      ],
    },
    {
      part: "Description",
      description:
        "What the control is for or what it takes: a <p> the control names in aria-describedby, from the server HTML on. One per field; it takes no id.",
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the description with your own component. Read once.",
        },
      ],
    },
    {
      part: "Error",
      description:
        'The error message: a <p>, rendered only while the field shows an error, which the control names in aria-describedby while it is rendered. Without children it shows the error from outside, else the browser\'s message. It is not a live region: add role="alert" to have it announced as it appears.',
      props: [
        {
          name: "match",
          type: '"valueMissing" | "typeMismatch" | "patternMismatch" | …',
          description:
            "A flag of the browser's validity. The Error shows only while the control has it, so each state gets a message of your own, in your app's language.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the error with your own component. Read once.",
        },
      ],
    },
  ],
  keyboard: [
    {
      keys: "Tab",
      action: "Moves focus away from the control, which touches the field.",
    },
  ],
};
