import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const separatorDoc: ComponentDoc = {
  slug: "separator",
  name: "Separator",
  category: "Display",
  description:
    "A line that divides sections of content or groups of items. It renders a div with role separator and aria-orientation, and draws nothing: give it a size and a colour, selected by data-horizontal or data-vertical. It is not focusable.",
  anatomy: tsx`<Separator.Root />`,
  api: [
    {
      part: "Root",
      description:
        '<div role="separator" aria-orientation>, with data-horizontal or data-vertical. Render an <hr> with render if you prefer one; the browser then draws its border and margins.',
      props: [
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description:
            "Whether the separator divides content stacked above and below it, or side by side.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the separator with your own element. Read once.",
        },
      ],
    },
  ],
  keyboard: [
    {
      keys: "Tab",
      action: "Moves past the separator, which is not focusable.",
    },
  ],
};
