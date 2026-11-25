import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/MultiComboboxExample";
import cssExampleCode from "./css/MultiComboboxExample.tsx?highlight";
import cssCode from "./css/multi-combobox.css?highlight";
import TailwindExample from "./tailwind/MultiComboboxExample";
import tailwindExampleCode from "./tailwind/MultiComboboxExample.tsx?highlight";

/** The Multi Combobox page's example, with plain CSS and with Tailwind CSS. */
export const multiComboboxExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "MultiComboboxExample.tsx", code: cssExampleCode },
      { name: "multi-combobox.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "MultiComboboxExample.tsx", code: tailwindExampleCode }],
  },
};
