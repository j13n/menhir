import type { ComponentExampleProps } from "../../components/ComponentExample";

import BootstrapExample from "./bootstrap/TabsExample";
import bootstrapExampleCode from "./bootstrap/TabsExample.tsx?highlight";
import bootstrapCssCode from "./bootstrap/tabs.module.css?highlight";
import CssExample from "./css/TabsExample";
import cssExampleCode from "./css/TabsExample.tsx?highlight";
import cssCode from "./css/tabs.css?highlight";
import ShadcnExample from "./shadcn/TabsExample";
import shadcnExampleCode from "./shadcn/TabsExample.tsx?highlight";
import TailwindExample from "./tailwind/TabsExample";
import tailwindExampleCode from "./tailwind/TabsExample.tsx?highlight";

/** The Tabs page's example, with plain CSS and with Tailwind CSS, and in the shadcn and Bootstrap looks. */
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
  looks: {
    bootstrap: {
      render: BootstrapExample,
      files: [
        { name: "TabsExample.tsx", code: bootstrapExampleCode },
        { name: "tabs.module.css", code: bootstrapCssCode },
      ],
    },
    shadcn: {
      render: ShadcnExample,
      files: [{ name: "TabsExample.tsx", code: shadcnExampleCode }],
    },
  },
};
