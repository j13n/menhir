import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/MeterExample";
import cssExampleCode from "./css/MeterExample.tsx?highlight";
import cssCode from "./css/meter.css?highlight";
import TailwindExample from "./tailwind/MeterExample";
import tailwindExampleCode from "./tailwind/MeterExample.tsx?highlight";

/** The Meter page's example, with plain CSS and with Tailwind CSS. */
export const meterExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "MeterExample.tsx", code: cssExampleCode },
      { name: "meter.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "MeterExample.tsx", code: tailwindExampleCode }],
  },
};
