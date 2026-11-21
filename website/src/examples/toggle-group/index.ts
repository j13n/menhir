import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/ToggleGroupExample";
import cssExampleCode from "./css/ToggleGroupExample.tsx?highlight";
import cssCode from "./css/toggle-group.css?highlight";
import TailwindExample from "./tailwind/ToggleGroupExample";
import tailwindExampleCode from "./tailwind/ToggleGroupExample.tsx?highlight";

/** The Toggle Group page's example, with plain CSS and with Tailwind CSS. */
export const toggleGroupExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "ToggleGroupExample.tsx", code: cssExampleCode },
      { name: "toggle-group.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "ToggleGroupExample.tsx", code: tailwindExampleCode }],
  },
};
