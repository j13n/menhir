import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/ProgressExample";
import cssExampleCode from "./css/ProgressExample.tsx?raw";
import cssCode from "./css/progress.css?raw";
import TailwindExample from "./tailwind/ProgressExample";
import tailwindExampleCode from "./tailwind/ProgressExample.tsx?raw";

/** The Progress page's example, with plain CSS and with Tailwind CSS. */
export const progressExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "ProgressExample.tsx", code: cssExampleCode },
      { name: "progress.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "ProgressExample.tsx", code: tailwindExampleCode }],
  },
};
