import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/SwitchExample";
import cssExampleCode from "./css/SwitchExample.tsx?highlight";
import cssCode from "./css/switch.css?highlight";
import TailwindExample from "./tailwind/SwitchExample";
import tailwindExampleCode from "./tailwind/SwitchExample.tsx?highlight";

/** The Switch page's example, with plain CSS and with Tailwind CSS. */
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
};
