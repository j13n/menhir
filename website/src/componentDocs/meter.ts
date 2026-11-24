import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const meterDoc: ComponentDoc = {
  slug: "meter",
  name: "Meter",
  category: "Display",
  description:
    'Shows a measurement within a known range, such as a battery\'s charge or the storage a disk has used. It renders a div with role="meter" and the value in aria-valuenow, aria-valuetext and the CSS custom property --meter, and draws nothing: size an element inside it with --meter. For how far a task has got, such as an upload, use Progress instead, and for a value with no meaningful maximum, neither. The role requires a name: give it aria-label, or aria-labelledby naming an element.',
  anatomy: tsx`<Meter.Root>
  <Meter.Value />
</Meter.Root>`,
  api: [
    {
      part: "Root",
      description:
        '<div role="meter">, with aria-valuemin, aria-valuemax, aria-valuenow and aria-valuetext. Its style sets --meter, the percentage of the range, such as 25%, which every element inside it inherits: draw the filled part with a plain element, such as width: var(--meter).',
      props: [
        {
          name: "value",
          type: "number",
          description:
            "The measurement, from min to max. A value outside the range is clamped to it.",
        },
        {
          name: "min",
          type: "number",
          default: "0",
          description: "The lowest value the measurement can take.",
        },
        {
          name: "max",
          type: "number",
          default: "100",
          description: "The highest value the measurement can take.",
        },
        {
          name: "format",
          type: "Intl.NumberFormatOptions",
          default: '{ style: "percent" }',
          description:
            'How aria-valuetext and Meter.Value format the value. The percent style formats the percentage of the range; any other style formats the value itself, such as { style: "unit", unit: "gigabyte" } for "120 GB". For other text, such as "50% (6 hours) remaining", pass your own aria-valuetext.',
        },
        {
          name: "locale",
          type: "Intl.LocalesArgument",
          description:
            "The language to format in, else the runtime's default. Pass it when rendering on the server, so that the server and the browser format alike.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the meter with your own component. Read once.",
        },
      ],
    },
    {
      part: "Value",
      description:
        "<span> with the value as text, the same as the Root's aria-valuetext, yours if you pass one.",
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the value with your own component. Read once.",
        },
      ],
    },
  ],
  keyboard: [
    {
      keys: "Tab",
      action:
        "Moves past the meter, which is not focusable: the user cannot change its value.",
    },
  ],
};
