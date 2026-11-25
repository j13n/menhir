import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/SliderExample";
import cssExampleCode from "./css/SliderExample.tsx?highlight";
import cssCode from "./css/slider.css?highlight";
import inAFieldCode from "./in-a-field/SliderInField.tsx?highlight";
import TailwindExample from "./tailwind/SliderExample";
import tailwindExampleCode from "./tailwind/SliderExample.tsx?highlight";

/** The Slider page's example, with plain CSS and with Tailwind CSS. */
export const sliderExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "SliderExample.tsx", code: cssExampleCode },
      { name: "slider.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "SliderExample.tsx", code: tailwindExampleCode }],
  },
};

/** The code of the Slider page's further sections, by their id. */
export const sliderSectionCode = {
  "in-a-field": inAFieldCode,
};
