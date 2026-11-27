import type { ComponentExampleProps } from "../../components/ComponentExample";
import bootstrapButtonCode from "../../looks/bootstrap/button.module.css?highlight";

import BootstrapExample from "./bootstrap/MenuExample";
import bootstrapExampleCode from "./bootstrap/MenuExample.tsx?highlight";
import bootstrapCssCode from "./bootstrap/menu.module.css?highlight";
import CssExample from "./css/MenuExample";
import cssExampleCode from "./css/MenuExample.tsx?highlight";
import cssCode from "./css/menu.css?highlight";
import ShadcnExample from "./shadcn/MenuExample";
import shadcnExampleCode from "./shadcn/MenuExample.tsx?highlight";
import TailwindExample from "./tailwind/MenuExample";
import tailwindExampleCode from "./tailwind/MenuExample.tsx?highlight";

/** The Menu page's example, with plain CSS and with Tailwind CSS, and in the shadcn and Bootstrap looks. */
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
  looks: {
    bootstrap: {
      render: BootstrapExample,
      files: [
        { name: "MenuExample.tsx", code: bootstrapExampleCode },
        { name: "menu.module.css", code: bootstrapCssCode },
        { name: "button.module.css", code: bootstrapButtonCode },
      ],
    },
    shadcn: {
      render: ShadcnExample,
      files: [{ name: "MenuExample.tsx", code: shadcnExampleCode }],
    },
  },
};
