import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/PopoverExample";
import cssExampleCode from "./css/PopoverExample.tsx?highlight";
import cssCode from "./css/popover.css?highlight";
import ShadcnExample from "./shadcn/PopoverExample";
import shadcnExampleCode from "./shadcn/PopoverExample.tsx?highlight";
import TailwindExample from "./tailwind/PopoverExample";
import tailwindExampleCode from "./tailwind/PopoverExample.tsx?highlight";

/** The Popover page's example, with plain CSS and with Tailwind CSS, and in the shadcn look. */
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
    shadcn: {
      render: ShadcnExample,
      files: [{ name: "PopoverExample.tsx", code: shadcnExampleCode }],
    },
  },
};
