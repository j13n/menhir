import type { ComponentExampleProps } from "../../components/ComponentExample";
import bootstrapButtonCode from "../../looks/bootstrap/button.module.css?highlight";

import BootstrapExample from "./bootstrap/DialogExample";
import bootstrapExampleCode from "./bootstrap/DialogExample.tsx?highlight";
import bootstrapCssCode from "./bootstrap/dialog.module.css?highlight";
import CssExample from "./css/DialogExample";
import cssExampleCode from "./css/DialogExample.tsx?highlight";
import cssCode from "./css/dialog.css?highlight";
import ShadcnExample from "./shadcn/DialogExample";
import shadcnExampleCode from "./shadcn/DialogExample.tsx?highlight";
import TailwindExample from "./tailwind/DialogExample";
import tailwindExampleCode from "./tailwind/DialogExample.tsx?highlight";

/** The Dialog page's example, with plain CSS and with Tailwind CSS, and in the shadcn and Bootstrap looks. */
export const dialogExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "DialogExample.tsx", code: cssExampleCode },
      { name: "dialog.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "DialogExample.tsx", code: tailwindExampleCode }],
  },
  looks: {
    bootstrap: {
      render: BootstrapExample,
      files: [
        { name: "DialogExample.tsx", code: bootstrapExampleCode },
        { name: "dialog.module.css", code: bootstrapCssCode },
        { name: "button.module.css", code: bootstrapButtonCode },
      ],
    },
    shadcn: {
      render: ShadcnExample,
      files: [{ name: "DialogExample.tsx", code: shadcnExampleCode }],
    },
  },
};
