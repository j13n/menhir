import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/PreviewCardExample";
import cssExampleCode from "./css/PreviewCardExample.tsx?highlight";
import cssCode from "./css/preview-card.css?highlight";
import loadingCode from "./loading/PreviewCardLoading.tsx?highlight";
import TailwindExample from "./tailwind/PreviewCardExample";
import tailwindExampleCode from "./tailwind/PreviewCardExample.tsx?highlight";

/** The Preview Card page's example, with plain CSS and with Tailwind CSS. */
export const previewCardExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "PreviewCardExample.tsx", code: cssExampleCode },
      { name: "preview-card.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "PreviewCardExample.tsx", code: tailwindExampleCode }],
  },
};

/** The code of the Preview Card page's further sections, by their id. */
export const previewCardSectionCode = {
  loading: loadingCode,
};
