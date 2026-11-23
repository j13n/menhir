import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/ContextMenuExample";
import cssExampleCode from "./css/ContextMenuExample.tsx?highlight";
import cssCode from "./css/context-menu.css?highlight";
import TailwindExample from "./tailwind/ContextMenuExample";
import tailwindExampleCode from "./tailwind/ContextMenuExample.tsx?highlight";

/** The Context Menu page's example, with plain CSS and with Tailwind CSS. */
export const contextMenuExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "ContextMenuExample.tsx", code: cssExampleCode },
      { name: "context-menu.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "ContextMenuExample.tsx", code: tailwindExampleCode }],
  },
};
