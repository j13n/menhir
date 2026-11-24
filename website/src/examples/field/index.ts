import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/FieldExample";
import cssExampleCode from "./css/FieldExample.tsx?highlight";
import cssCode from "./css/field.css?highlight";
import fieldsetCode from "./fieldset/FieldsetGroup.tsx?highlight";
import TailwindExample from "./tailwind/FieldExample";
import tailwindExampleCode from "./tailwind/FieldExample.tsx?highlight";

/** The Field page's example, with plain CSS and with Tailwind CSS. */
export const fieldExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "FieldExample.tsx", code: cssExampleCode },
      { name: "field.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "FieldExample.tsx", code: tailwindExampleCode }],
  },
};

/** The code of the Field page's further sections, by their id. */
export const fieldSectionCode = {
  fieldset: fieldsetCode,
};
