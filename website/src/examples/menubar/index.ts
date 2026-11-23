import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/MenubarExample";
import cssExampleCode from "./css/MenubarExample.tsx?highlight";
import cssCode from "./css/menubar.css?highlight";
import TailwindExample from "./tailwind/MenubarExample";
import tailwindExampleCode from "./tailwind/MenubarExample.tsx?highlight";

/** The Menubar page's example, with plain CSS and with Tailwind CSS. */
export const menubarExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "MenubarExample.tsx", code: cssExampleCode },
      { name: "menubar.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "MenubarExample.tsx", code: tailwindExampleCode }],
  },
};
