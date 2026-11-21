import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/CollapsibleExample";
import cssExampleCode from "./css/CollapsibleExample.tsx?raw";
import cssCode from "./css/collapsible.css?raw";
import TailwindExample from "./tailwind/CollapsibleExample";
import tailwindExampleCode from "./tailwind/CollapsibleExample.tsx?raw";

/** The Collapsible page's example, with plain CSS and with Tailwind CSS. */
export const collapsibleExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "CollapsibleExample.tsx", code: cssExampleCode },
      { name: "collapsible.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "CollapsibleExample.tsx", code: tailwindExampleCode }],
  },
};
