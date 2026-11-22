import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/AlertDialogExample";
import cssExampleCode from "./css/AlertDialogExample.tsx?highlight";
import cssCode from "./css/alert-dialog.css?highlight";
import TailwindExample from "./tailwind/AlertDialogExample";
import tailwindExampleCode from "./tailwind/AlertDialogExample.tsx?highlight";

/** The Alert Dialog page's example, with plain CSS and with Tailwind CSS. */
export const alertDialogExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "AlertDialogExample.tsx", code: cssExampleCode },
      { name: "alert-dialog.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "AlertDialogExample.tsx", code: tailwindExampleCode }],
  },
};
