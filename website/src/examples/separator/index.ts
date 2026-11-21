import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/SeparatorExample";
import cssExampleCode from "./css/SeparatorExample.tsx?highlight";
import cssCode from "./css/separator.css?highlight";
import TailwindExample from "./tailwind/SeparatorExample";
import tailwindExampleCode from "./tailwind/SeparatorExample.tsx?highlight";

/** The Separator page's example, with plain CSS and with Tailwind CSS. */
export const separatorExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "SeparatorExample.tsx", code: cssExampleCode },
      { name: "separator.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "SeparatorExample.tsx", code: tailwindExampleCode }],
  },
};
