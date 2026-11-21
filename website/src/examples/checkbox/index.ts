import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/CheckboxExample";
import cssExampleCode from "./css/CheckboxExample.tsx?highlight";
import cssCode from "./css/checkbox.css?highlight";
import TailwindExample from "./tailwind/CheckboxExample";
import tailwindExampleCode from "./tailwind/CheckboxExample.tsx?highlight";

/** The Checkbox page's example, with plain CSS and with Tailwind CSS. */
export const checkboxExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "CheckboxExample.tsx", code: cssExampleCode },
      { name: "checkbox.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "CheckboxExample.tsx", code: tailwindExampleCode }],
  },
};
