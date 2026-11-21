import type { ComponentDoc } from "./types";

export const toggleDoc: ComponentDoc = {
  slug: "toggle",
  name: "Toggle",
  description:
    "A button that stays pressed until it is pressed again, such as Bold in a text editor. It renders a native button with aria-pressed. Keep its label the same in both states: a Mute toggle stays Mute while pressed, and screen readers announce it as pressed.",
  anatomy: "<Toggle.Root />",
  api: [
    {
      part: "Root",
      description:
        '<button type="button" aria-pressed>. Name it with its content, or with aria-label when it shows only an icon. Its render function must render a <button>.',
      props: [
        {
          name: "pressed",
          type: "boolean",
          description:
            "Whether the toggle is pressed, when controlled. Pair it with onPressedChange.",
        },
        {
          name: "defaultPressed",
          type: "boolean",
          default: "false",
          description: "Whether the toggle starts pressed, when uncontrolled.",
        },
        {
          name: "onPressedChange",
          type: "(pressed: boolean) => void",
          description:
            "Called with the new value when the user presses the toggle. A controlled toggle changes only if pressed does.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Whether the toggle ignores the user. It cannot be focused either.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the toggle with your own button component. Read once.",
        },
      ],
    },
  ],
  keyboard: [
    { keys: "Space", action: "Presses or releases the toggle." },
    { keys: "Enter", action: "Presses or releases the toggle." },
    { keys: "Tab", action: "Moves focus to or away from the toggle." },
  ],
};
