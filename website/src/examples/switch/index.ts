import type { ComponentExampleProps } from "../../components/ComponentExample";

import BootstrapExample from "./bootstrap/SwitchExample";
import bootstrapExampleCode from "./bootstrap/SwitchExample.tsx?highlight";
import bootstrapCssCode from "./bootstrap/switch.module.css?highlight";
import CssExample from "./css/SwitchExample";
import cssExampleCode from "./css/SwitchExample.tsx?highlight";
import cssCode from "./css/switch.css?highlight";
import inAFieldCode from "./in-a-field/SwitchInField.tsx?highlight";
import ShadcnExample from "./shadcn/SwitchExample";
import shadcnExampleCode from "./shadcn/SwitchExample.tsx?highlight";
import TailwindExample from "./tailwind/SwitchExample";
import tailwindExampleCode from "./tailwind/SwitchExample.tsx?highlight";

/** The Switch page's example, with plain CSS and with Tailwind CSS, and in the shadcn and Bootstrap looks. */
export const switchExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "SwitchExample.tsx", code: cssExampleCode },
      { name: "switch.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "SwitchExample.tsx", code: tailwindExampleCode }],
  },
  looks: {
    bootstrap: {
      render: BootstrapExample,
      files: [
        { name: "SwitchExample.tsx", code: bootstrapExampleCode },
        { name: "switch.module.css", code: bootstrapCssCode },
      ],
    },
    shadcn: {
      render: ShadcnExample,
      files: [{ name: "SwitchExample.tsx", code: shadcnExampleCode }],
    },
  },
};

/** The code of the Switch page's further sections, by their id. */
export const switchSectionCode = {
  "in-a-field": inAFieldCode,
};
