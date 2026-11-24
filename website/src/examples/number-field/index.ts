import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/NumberFieldExample";
import cssExampleCode from "./css/NumberFieldExample.tsx?highlight";
import cssCode from "./css/number-field.css?highlight";
import inAFieldCode from "./in-a-field/NumberFieldInField.tsx?highlight";
import TailwindExample from "./tailwind/NumberFieldExample";
import tailwindExampleCode from "./tailwind/NumberFieldExample.tsx?highlight";

/** The Number Field page's example, with plain CSS and with Tailwind CSS. */
export const numberFieldExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "NumberFieldExample.tsx", code: cssExampleCode },
      { name: "number-field.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "NumberFieldExample.tsx", code: tailwindExampleCode }],
  },
};

/** The code of the Number Field page's further sections, by their id. */
export const numberFieldSectionCode = {
  "in-a-field": inAFieldCode,
};
