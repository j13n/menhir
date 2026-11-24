import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/RadioExample";
import cssExampleCode from "./css/RadioExample.tsx?highlight";
import cssCode from "./css/radio.css?highlight";
import inAFieldCode from "./in-a-field/RadioInField.tsx?highlight";
import TailwindExample from "./tailwind/RadioExample";
import tailwindExampleCode from "./tailwind/RadioExample.tsx?highlight";

/** The Radio page's example, with plain CSS and with Tailwind CSS. */
export const radioExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "RadioExample.tsx", code: cssExampleCode },
      { name: "radio.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "RadioExample.tsx", code: tailwindExampleCode }],
  },
};

/** The code of the Radio page's further sections, by their id. */
export const radioSectionCode = {
  "in-a-field": inAFieldCode,
};
