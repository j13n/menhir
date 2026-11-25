import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const sliderDoc: ComponentDoc = {
  slug: "slider",
  name: "Slider",
  category: "Inputs",
  description:
    "A thumb the user drags along a track, or moves with the arrow keys, to pick a number in a range: the WAI-ARIA slider pattern. The thumb's control is a native <input type=\"range\">, visually hidden inside it, so the role, the value, a <label for>, focus, disabled and the form are the browser's, in the server HTML too; the track, the filled part and the thumb are your own elements, placed with the --slider property, the value's percentage of the range. The value's text is formatted with Intl.NumberFormat, or by a function of yours, and is what a screen reader reads out.",
  anatomy: tsx`<Slider.Root>
  <Slider.Value />
  <Slider.Track>
    <div class="indicator" />
    <Slider.Thumb />
  </Slider.Track>
</Slider.Root>`,
  api: [
    {
      part: "Root",
      description:
        "A <div> around the parts, which holds the value and sets --slider to its percentage of the range, such as 25%, for every element inside: size the filled part with width: var(--slider) and place the thumb with inset-inline-start, which mirrors right to left by itself. Its id, aria-describedby and aria-invalid go on the Thumb's input, so a <label for> its id names the slider, and it joins a Field as Field.Control's render. Every part has data-horizontal or data-vertical, and data-disabled.",
      props: [
        {
          name: "value",
          type: "number",
          description:
            "The value, when controlled. Pair it with onValueChange.",
        },
        {
          name: "defaultValue",
          type: "number",
          default: "midpoint of min and max",
          description:
            "The value to start with, when uncontrolled. A form reset goes back to it.",
        },
        {
          name: "onValueChange",
          type: "(value: number) => void",
          description:
            "Called with the new value on each change: each step of a drag, each key, and a form reset.",
        },
        {
          name: "onValueCommit",
          type: "(value: number) => void",
          description:
            "Called with the value once the user has finished changing it: when a drag is released or canceled, when a key is released (a held key commits once) or focus leaves first, and on a form reset you take. For work too costly to run on every step, such as a request.",
        },
        {
          name: "min",
          type: "number",
          default: "0",
          description: "The lowest value. Home sets it.",
        },
        {
          name: "max",
          type: "number",
          default: "100",
          description:
            "The highest value. The thumb stops at the last value on the step grid at or under it, which End sets.",
        },
        {
          name: "step",
          type: "number",
          default: "1",
          description:
            "The distance between the values the thumb can take, counted from min. The arrow keys move by it.",
        },
        {
          name: "largeStep",
          type: "number",
          default: "step × 10",
          description: "How much Page Up and Page Down move the thumb.",
        },
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description:
            'The direction of the track. A vertical slider runs from the bottom up, and its input has aria-orientation="vertical".',
        },
        {
          name: "format",
          type: "Intl.NumberFormatOptions | ((value: number) => string)",
          description:
            'How the value reads as text, in aria-valuetext and Slider.Value: options for Intl.NumberFormat, such as { useGrouping: false } for a year or { style: "percent" }, or a function from the value to its text, such as a month\'s name. By default the value itself, grouped, such as 1,250.',
        },
        {
          name: "locale",
          type: "Intl.LocalesArgument",
          description:
            "The language to format the value in, else the browser's. Pass it when rendering on the server, so that the server and the browser agree.",
        },
        {
          name: "name",
          type: "string",
          description: "The name the value is submitted under.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether the slider ignores the keys and the pointer, leaves the tab order, and submits nothing.",
        },
        {
          name: "form",
          type: "string",
          description:
            "The id of the form the value belongs to, when the slider is not inside it.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the Root as another element. Read once.",
        },
      ],
    },
    {
      part: "Track",
      description:
        "A <div>, the area where a press moves the thumb and a drag follows the pointer, also outside it once started. It has touch-action: none, so a touch drag moves the thumb and does not scroll the page. Put the Thumb inside it, and give it its size: a taller Track is easier to press than the rail you draw in it.",
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the Track as another element. Read once.",
        },
      ],
    },
    {
      part: "Thumb",
      description:
        'A <div>, the thumb you style and place, with the slider\'s control inside it: a visually hidden <input type="range"> that takes focus and the keys, with aria-valuetext. Style its focus with :has(:focus-visible). Its aria-label, aria-labelledby and aria-describedby go on the input, so give it aria-label when no <label> names the Root.',
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the Thumb as another element. Read once.",
        },
      ],
    },
    {
      part: "Value",
      description:
        "A <span> with the value's text, the Root's aria-valuetext, in its format and locale.",
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the Value as another element. Read once.",
        },
      ],
    },
  ],
  keyboard: [
    {
      keys: "ArrowRight",
      action: "Increases the value by step; decreases it right to left.",
    },
    { keys: "ArrowUp", action: "Increases the value by step." },
    {
      keys: "ArrowLeft",
      action: "Decreases the value by step; increases it right to left.",
    },
    { keys: "ArrowDown", action: "Decreases the value by step." },
    { keys: "PageUp", action: "Increases the value by largeStep." },
    { keys: "PageDown", action: "Decreases the value by largeStep." },
    { keys: "Home", action: "Sets the value to min." },
    {
      keys: "End",
      action:
        "Sets the value to max, or to the last step under it when max is off the step grid.",
    },
  ],
  sections: [
    {
      id: "in-a-field",
      title: "In a Field",
      text: "A Slider joins a Field as Field.Control's render, with the Root as the Control: the Root hands the Field's id, description and aria-invalid to the Thumb's input, so the Label names it, and its name and disabled reach the input and the Track. A range input is never invalid, so the Field shows only errors you pass it, or a Form's. Put the Track and the Thumb inside Field.Control, which passes its children to the Root.",
    },
  ],
};
