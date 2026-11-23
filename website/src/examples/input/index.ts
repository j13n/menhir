import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/InputExample";
import cssExampleCode from "./css/InputExample.tsx?highlight";
import cssCode from "./css/input.css?highlight";
import inAFieldCode from "./in-a-field/InputInField.tsx?highlight";
import oneTimeCodeCode from "./one-time-code/OneTimeCode.tsx?highlight";
import TailwindExample from "./tailwind/InputExample";
import tailwindExampleCode from "./tailwind/InputExample.tsx?highlight";

/** The Input page's example, with plain CSS and with Tailwind CSS. */
export const inputExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "InputExample.tsx", code: cssExampleCode },
      { name: "input.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "InputExample.tsx", code: tailwindExampleCode }],
  },
};

/** The code of the Input page's further sections, by their id. */
export const inputSectionCode = {
  "in-a-field": inAFieldCode,
  "one-time-code": oneTimeCodeCode,
};
