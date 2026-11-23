import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/SelectExample";
import cssExampleCode from "./css/SelectExample.tsx?highlight";
import cssCode from "./css/select.css?highlight";
import TailwindExample from "./tailwind/SelectExample";
import tailwindExampleCode from "./tailwind/SelectExample.tsx?highlight";

/** The Select page's example, with plain CSS and with Tailwind CSS. */
export const selectExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "SelectExample.tsx", code: cssExampleCode },
      { name: "select.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "SelectExample.tsx", code: tailwindExampleCode }],
  },
};
