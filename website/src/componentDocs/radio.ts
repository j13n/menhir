import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const radioDoc: ComponentDoc = {
  slug: "radio",
  name: "Radio",
  category: "Inputs",
  description:
    'A group of radio buttons that holds one value: the user checks one, and checking another unchecks it. It renders a native <fieldset role="radiogroup">, named by its <legend>, and each radio is a native button with a hidden radio input, so the form receives the checked value under the group\'s name. The group is one tab stop, and the arrow keys move between the radios and check them.',
  anatomy: tsx`<Radio.Root>
  <legend />
  <Radio.Item>
    <Radio.Indicator />
  </Radio.Item>
</Radio.Root>`,
  api: [
    {
      part: "Root",
      description:
        'The group: a <fieldset role="radiogroup">, named by a <legend> inside it, with aria-required, data-disabled and data-required. Render it as a <div> with aria-labelledby when the group\'s name is outside it.',
      props: [
        {
          name: "value",
          type: "string | null",
          description:
            "The checked radio's value, when controlled. Pair it with onValueChange. None checked is null.",
        },
        {
          name: "defaultValue",
          type: "string | null",
          default: "null",
          description:
            "The radio checked at first, when uncontrolled. A form reset goes back to it.",
        },
        {
          name: "onValueChange",
          type: "(value: string | null) => void",
          description:
            "Called with the new value when the user checks a radio, or with defaultValue when the form is reset. A controlled group changes only if value does.",
        },
        {
          name: "name",
          type: "string",
          description:
            "The name the checked radio's value is submitted under. The form's elements then hold the radios as a radio group: form.elements[name].value is the checked value.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether every radio ignores the user. The fieldset is disabled too, with every control inside it, and the form submits nothing.",
        },
        {
          name: "required",
          type: "boolean",
          default: "false",
          description:
            "Whether the form can be submitted only while a radio is checked. The browser blocks the submission and focuses the first enabled radio.",
        },
        {
          name: "form",
          type: "string",
          description:
            "The id of the form the radios belong to, when the group is not inside it.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the group as another element, such as a <div>. Read once.",
        },
      ],
    },
    {
      part: "Item",
      description:
        'One radio: a <button type="button" role="radio"> with aria-checked, data-checked or data-unchecked, and data-disabled, then a visually hidden <input type="radio"> for the form. Only the checked radio, or the first enabled one while none is checked, is in the tab order.',
      props: [
        {
          name: "value",
          type: "string",
          description:
            "Identifies the radio in the group's value, and is what the form submits while it is checked.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether this radio ignores the user. The arrow keys skip it. A disabled radio that is checked keeps the value, but the form does not submit it.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the radio with your own component, which must render a <button>. Read once.",
        },
      ],
    },
    {
      part: "Indicator",
      description:
        "The dot: a <span> with its radio's data-checked or data-unchecked and data-disabled, always rendered, so CSS shows it by state. Place it inside an Item.",
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
    {
      keys: "Tab",
      action:
        "Moves focus into the group, onto the checked radio or the first enabled one, and out of it.",
    },
    { keys: "Space", action: "Checks the focused radio." },
    {
      keys: "ArrowDown",
      action:
        "Moves focus to the next enabled radio and checks it; from the last, to the first.",
    },
    {
      keys: "ArrowRight",
      action:
        "Moves focus to the next enabled radio and checks it, or the previous one right to left; wraps.",
    },
    {
      keys: "ArrowUp",
      action:
        "Moves focus to the previous enabled radio and checks it; from the first, to the last.",
    },
    {
      keys: "ArrowLeft",
      action:
        "Moves focus to the previous enabled radio and checks it, or the next one right to left; wraps.",
    },
  ],
  sections: [
    {
      id: "in-a-field",
      title: "In a Field",
      text: "The group joins a Field as Field.Control's render: the fieldset gets the Field's description and error in aria-describedby, aria-invalid while the error shows, and the Field's name and disabled, which the group passes to its radios. Name the group with a <legend>, not Field.Label, which cannot name a fieldset, and put the Error inside it. With required, the browser blocks a submission while none is checked and focuses the first radio; the error shows once focus has left the group, a radio was checked or a submission was attempted. The browser's message asks to select one of the options; give the Error match=\"valueMissing\" and your own words to say which.",
    },
  ],
};
