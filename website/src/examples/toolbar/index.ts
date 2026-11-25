import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/ToolbarExample";
import cssExampleCode from "./css/ToolbarExample.tsx?highlight";
import cssCode from "./css/toolbar.css?highlight";
import otherControlsCode from "./other-controls/EditorToolbar.tsx?highlight";
import TailwindExample from "./tailwind/ToolbarExample";
import tailwindExampleCode from "./tailwind/ToolbarExample.tsx?highlight";

/** The Toolbar page's example, with plain CSS and with Tailwind CSS. */
export const toolbarExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "ToolbarExample.tsx", code: cssExampleCode },
      { name: "toolbar.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "ToolbarExample.tsx", code: tailwindExampleCode }],
  },
};

/** The code of the Toolbar page's further sections, by their id. */
export const toolbarSectionCode = {
  "other-controls": [otherControlsCode],
};
