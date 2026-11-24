import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/CheckboxGroupExample";
import cssExampleCode from "./css/CheckboxGroupExample.tsx?highlight";
import cssCode from "./css/checkbox-group.css?highlight";
import inAFieldCode from "./in-a-field/CheckboxGroupInField.tsx?highlight";
import TailwindExample from "./tailwind/CheckboxGroupExample";
import tailwindExampleCode from "./tailwind/CheckboxGroupExample.tsx?highlight";

/** The Checkbox Group page's example, with plain CSS and with Tailwind CSS. */
export const checkboxGroupExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "CheckboxGroupExample.tsx", code: cssExampleCode },
      { name: "checkbox-group.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "CheckboxGroupExample.tsx", code: tailwindExampleCode }],
  },
};

/** The code of the Checkbox Group page's further sections, by their id. */
export const checkboxGroupSectionCode = {
  "in-a-field": inAFieldCode,
};
