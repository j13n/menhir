import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/TooltipExample";
import cssExampleCode from "./css/TooltipExample.tsx?highlight";
import cssCode from "./css/tooltip.css?highlight";
import TailwindExample from "./tailwind/TooltipExample";
import tailwindExampleCode from "./tailwind/TooltipExample.tsx?highlight";

/** The Tooltip page's example, with plain CSS and with Tailwind CSS. */
export const tooltipExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "TooltipExample.tsx", code: cssExampleCode },
      { name: "tooltip.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "TooltipExample.tsx", code: tailwindExampleCode }],
  },
};
