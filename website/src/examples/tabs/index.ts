import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/TabsExample";
import cssExampleCode from "./css/TabsExample.tsx?highlight";
import cssCode from "./css/tabs.css?highlight";
import TailwindExample from "./tailwind/TabsExample";
import tailwindExampleCode from "./tailwind/TabsExample.tsx?highlight";

/** The Tabs page's example, with plain CSS and with Tailwind CSS. */
export const tabsExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "TabsExample.tsx", code: cssExampleCode },
      { name: "tabs.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "TabsExample.tsx", code: tailwindExampleCode }],
  },
};
