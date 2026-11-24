import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const checkboxGroupDoc: ComponentDoc = {
  slug: "checkbox-group",
  name: "Checkbox Group",
  description:
    "Checkboxes that hold one list of values, with an optional parent checkbox that checks all or none. The parent is mixed while some are checked. It renders a native <fieldset>, named by its <legend>, and each box is a Checkbox: the form receives one entry per checked box under the group's name. Tab moves between the boxes, and Space checks one, as on a Checkbox.",
  anatomy: tsx`<CheckboxGroup.Root>
  <legend />
  <CheckboxGroup.Parent>
    <CheckboxGroup.Indicator />
  </CheckboxGroup.Parent>
  <CheckboxGroup.Item>
    <CheckboxGroup.Indicator />
  </CheckboxGroup.Item>
</CheckboxGroup.Root>`,
  api: [
    {
      part: "Root",
      description:
        'The group: a <fieldset>, named by a <legend> inside it, with data-disabled and data-required. A visually hidden radio after it carries required. Render it as a <div role="group"> with aria-labelledby when the group\'s name is outside it.',
      props: [
        {
          name: "value",
          type: "string[]",
          description:
            "The values of the checked boxes, when controlled. Pair it with onValueChange. None checked is [].",
        },
        {
          name: "defaultValue",
          type: "string[]",
          default: "[]",
          description:
            "The values of the boxes checked at first, when uncontrolled. A form reset goes back to it.",
        },
        {
          name: "onValueChange",
          type: "(value: string[]) => void",
          description:
            "Called with the new list when the user checks or unchecks a box, or the form is reset. A box checked is added at the end. A controlled group changes only if value does.",
        },
        {
          name: "name",
          type: "string",
          description:
            "The name each checked box is submitted under, one entry per box: formData.getAll(name).",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether every box ignores the user. The fieldset is disabled too, with every control inside it, and the form submits no box.",
        },
        {
          name: "required",
          type: "boolean",
          default: "false",
          description:
            "Whether the form can be submitted only while at least one box is checked. No box is required on its own. It counts the value, so a checked box that is disabled satisfies it although the form does not submit it: make a box that must stay checked readOnly instead.",
        },
        {
          name: "form",
          type: "string",
          description:
            "The id of the form the boxes belong to, when the group is not inside it.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            'Renders the group as another element, such as a <div role="group">. Read once.',
        },
      ],
    },
    {
      part: "Item",
      description:
        "One box: a Checkbox.Root, checked while the group's value has its value, and submitted under the group's name. It takes every prop of Checkbox.Root but the value props, which are the group's, and name, required and form.",
      props: [
        {
          name: "value",
          type: "string",
          description:
            "Identifies the box in the group's value, and is what the form submits while it is checked.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether this box ignores the user. A disabled box keeps its place in the value, but the form does not submit it.",
        },
        {
          name: "readOnly",
          type: "boolean",
          default: "false",
          description:
            "Whether this box can be focused but not changed. Unlike a disabled box, the form submits it: use it for a box that must stay checked, such as essential cookies.",
        },
      ],
    },
    {
      part: "Parent",
      description:
        'A Checkbox.Root over the boxes of values: checked while the group has all of them, aria-checked="mixed" and data-indeterminate while it has some. A click on a mixed parent checks all, on a checked one unchecks all, and on an unchecked one brings back the boxes that were checked when it was last mixed, or checks all. It submits nothing. Leave it out, and the group does not bundle it.',
      props: [
        {
          name: "values",
          type: "string[]",
          description:
            "The values of the boxes the parent checks and unchecks, usually every Item's. Other values in the group's value are kept.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether the parent ignores the user.",
        },
      ],
    },
    {
      part: "Indicator",
      description:
        "Checkbox.Indicator: the check mark, a <span> with its box's data-checked, data-unchecked or data-indeterminate. Place it inside an Item or the Parent.",
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
    { keys: "Space", action: "Checks or unchecks the focused box." },
    {
      keys: "Tab",
      action: "Moves focus to the next box, or out of the group.",
    },
  ],
  sections: [
    {
      id: "in-a-field",
      title: "In a Field",
      text: "The group joins a Field as Field.Control's render: the fieldset gets the Field's description and error in aria-describedby, aria-invalid while the error shows, and the Field's name and disabled, which the group passes to its boxes. Name the group with a <legend>, not Field.Label, which cannot name a fieldset, and put the Error inside it. With required, the browser blocks a submission while no box is checked and focuses the first box; the error shows once focus has left the group, a box has changed or a submission was attempted. The browser's message asks to select one of the options; give the Error match=\"valueMissing\" and your own words to say which.",
    },
  ],
};
