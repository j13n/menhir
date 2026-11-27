import type { ComponentExampleProps } from "../../components/ComponentExample";

import BootstrapExample from "./bootstrap/SelectExample";
import bootstrapExampleCode from "./bootstrap/SelectExample.tsx?highlight";
import bootstrapCssCode from "./bootstrap/select.module.css?highlight";
import CssExample from "./css/SelectExample";
import cssExampleCode from "./css/SelectExample.tsx?highlight";
import cssCode from "./css/select.css?highlight";
import ShadcnExample from "./shadcn/SelectExample";
import shadcnExampleCode from "./shadcn/SelectExample.tsx?highlight";
import TailwindExample from "./tailwind/SelectExample";
import tailwindExampleCode from "./tailwind/SelectExample.tsx?highlight";

/** The Select page's example, with plain CSS and with Tailwind CSS, and in the shadcn and Bootstrap looks. */
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
  looks: {
    bootstrap: {
      render: BootstrapExample,
      files: [
        { name: "SelectExample.tsx", code: bootstrapExampleCode },
        { name: "select.module.css", code: bootstrapCssCode },
      ],
    },
    shadcn: {
      render: ShadcnExample,
      files: [{ name: "SelectExample.tsx", code: shadcnExampleCode }],
    },
  },
};
