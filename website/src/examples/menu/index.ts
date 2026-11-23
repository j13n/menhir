import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/MenuExample";
import cssExampleCode from "./css/MenuExample.tsx?highlight";
import cssCode from "./css/menu.css?highlight";
import TailwindExample from "./tailwind/MenuExample";
import tailwindExampleCode from "./tailwind/MenuExample.tsx?highlight";

/** The Menu page's example, with plain CSS and with Tailwind CSS. */
export const menuExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "MenuExample.tsx", code: cssExampleCode },
      { name: "menu.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "MenuExample.tsx", code: tailwindExampleCode }],
  },
};
