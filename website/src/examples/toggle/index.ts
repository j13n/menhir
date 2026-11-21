import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/ToggleExample";
import cssExampleCode from "./css/ToggleExample.tsx?highlight";
import cssCode from "./css/toggle.css?highlight";
import TailwindExample from "./tailwind/ToggleExample";
import tailwindExampleCode from "./tailwind/ToggleExample.tsx?highlight";

/** The Toggle page's example, with plain CSS and with Tailwind CSS. */
export const toggleExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "ToggleExample.tsx", code: cssExampleCode },
      { name: "toggle.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "ToggleExample.tsx", code: tailwindExampleCode }],
  },
};
