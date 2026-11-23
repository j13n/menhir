import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/ComboboxExample";
import cssExampleCode from "./css/ComboboxExample.tsx?highlight";
import cssCode from "./css/combobox.css?highlight";
import TailwindExample from "./tailwind/ComboboxExample";
import tailwindExampleCode from "./tailwind/ComboboxExample.tsx?highlight";

/** The Combobox page's example, with plain CSS and with Tailwind CSS. */
export const comboboxExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "ComboboxExample.tsx", code: cssExampleCode },
      { name: "combobox.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "ComboboxExample.tsx", code: tailwindExampleCode }],
  },
};
