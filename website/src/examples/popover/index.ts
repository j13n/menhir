import type { ComponentExampleProps } from "../../components/ComponentExample";
import bootstrapButtonCode from "../../looks/bootstrap/button.module.css?highlight";

import BootstrapExample from "./bootstrap/PopoverExample";
import bootstrapExampleCode from "./bootstrap/PopoverExample.tsx?highlight";
import bootstrapCssCode from "./bootstrap/popover.module.css?highlight";
import CssExample from "./css/PopoverExample";
import cssExampleCode from "./css/PopoverExample.tsx?highlight";
import cssCode from "./css/popover.css?highlight";
import ShadcnExample from "./shadcn/PopoverExample";
import shadcnExampleCode from "./shadcn/PopoverExample.tsx?highlight";
import TailwindExample from "./tailwind/PopoverExample";
import tailwindExampleCode from "./tailwind/PopoverExample.tsx?highlight";

/** The Popover page's example, with plain CSS and with Tailwind CSS, and in the shadcn and Bootstrap looks. */
export const popoverExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "PopoverExample.tsx", code: cssExampleCode },
      { name: "popover.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "PopoverExample.tsx", code: tailwindExampleCode }],
  },
  looks: {
    bootstrap: {
      render: BootstrapExample,
      files: [
        { name: "PopoverExample.tsx", code: bootstrapExampleCode },
        { name: "popover.module.css", code: bootstrapCssCode },
        { name: "button.module.css", code: bootstrapButtonCode },
      ],
    },
    shadcn: {
      render: ShadcnExample,
      files: [{ name: "PopoverExample.tsx", code: shadcnExampleCode }],
    },
  },
};
