import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/AccordionExample";
import cssExampleCode from "./css/AccordionExample.tsx?highlight";
import cssCode from "./css/accordion.css?highlight";
import TailwindExample from "./tailwind/AccordionExample";
import tailwindExampleCode from "./tailwind/AccordionExample.tsx?highlight";

/** The Accordion page's example, with plain CSS and with Tailwind CSS. */
export const accordionExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "AccordionExample.tsx", code: cssExampleCode },
      { name: "accordion.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "AccordionExample.tsx", code: tailwindExampleCode }],
  },
};
