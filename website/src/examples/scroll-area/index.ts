import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/ScrollAreaExample";
import cssExampleCode from "./css/ScrollAreaExample.tsx?highlight";
import cssCode from "./css/scroll-area.css?highlight";
import nativeScrollerCode from "./native-scroller/NativeScroller.tsx?highlight";
import nativeScrollerCssCode from "./native-scroller/native-scroller.css?highlight";
import TailwindExample from "./tailwind/ScrollAreaExample";
import tailwindExampleCode from "./tailwind/ScrollAreaExample.tsx?highlight";

/** The Scroll Area page's example, with plain CSS and with Tailwind CSS. */
export const scrollAreaExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "ScrollAreaExample.tsx", code: cssExampleCode },
      { name: "scroll-area.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "ScrollAreaExample.tsx", code: tailwindExampleCode }],
  },
};

/** The code of the Scroll Area page's further sections, by their id. */
export const scrollAreaSectionCode = {
  "native-scroller": [nativeScrollerCode, nativeScrollerCssCode],
};
