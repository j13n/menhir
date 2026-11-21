import type { ComponentDoc } from "./types";

export const progressDoc: ComponentDoc = {
  slug: "progress",
  name: "Progress",
  description:
    'Shows how far a task that takes a while has got, such as an upload. It renders a div with role="progressbar" and the value in aria-valuenow, aria-valuetext and the CSS custom property --progress, and draws nothing: size the indicator with --progress. A value of null is indeterminate, for a task whose progress is unknown. The role requires a name: give it aria-label, or aria-labelledby naming an element. When it shows a region loading, set aria-busy="true" on that region until it has loaded, and point the region\'s aria-describedby at the progress bar.',
  anatomy: `<Progress.Root>
  <Progress.Value />
  <Progress.Indicator />
</Progress.Root>`,
  api: [
    {
      part: "Root",
      description:
        '<div role="progressbar">, with aria-valuemin, aria-valuemax, aria-valuenow and aria-valuetext, and data-indeterminate, data-progressing or data-complete. Its style sets --progress, the percentage of the range, such as 25%, which every element inside it inherits.',
      props: [
        {
          name: "value",
          type: "number | null",
          description:
            "How far the task has got, from min to max, or null while unknown. A value outside the range is clamped to it.",
        },
        {
          name: "min",
          type: "number",
          default: "0",
          description: "The value at the start of the task.",
        },
        {
          name: "max",
          type: "number",
          default: "100",
          description: "The value when the task is complete.",
        },
        {
          name: "format",
          type: "Intl.NumberFormatOptions",
          default: '{ style: "percent" }',
          description:
            'How aria-valuetext and Progress.Value format the value. The percent style formats the percentage of the range; any other style formats the value itself, such as { style: "unit", unit: "megabyte" } for "42 MB". For other text, such as "3 of 10 files", pass your own aria-valuetext.',
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
          description:
            "Renders the progress bar with your own component. Read once.",
        },
      ],
    },
    {
      part: "Indicator",
      description:
        "<div> for the filled part of the bar, with the Root's data-* attributes. Give it a size from --progress, such as width: var(--progress), and its own while indeterminate, when --progress is unset.",
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the indicator with your own component. Read once.",
        },
      ],
    },
    {
      part: "Value",
      description:
        "<span> with the value as text, the same as the Root's aria-valuetext, yours if you pass one, and the Root's data-* attributes. Empty while indeterminate, unless you pass aria-valuetext.",
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
        "Moves past the progress bar, which is not focusable: the user cannot change its value.",
    },
  ],
};
