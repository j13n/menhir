import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/ToastExample";
import cssExampleCode from "./css/ToastExample.tsx?highlight";
import cssCode from "./css/toast.css?highlight";
import promiseCode from "./promise/save.ts?highlight";
import stackCssCode from "./stack/stack.css?highlight";
import stackCode from "./stack/StackedToasts.tsx?highlight";
import TailwindExample from "./tailwind/ToastExample";
import tailwindExampleCode from "./tailwind/ToastExample.tsx?highlight";

/** The Toast page's example, with plain CSS and with Tailwind CSS. */
export const toastExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "ToastExample.tsx", code: cssExampleCode },
      { name: "toast.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "ToastExample.tsx", code: tailwindExampleCode }],
  },
};

/** The code of the Toast page's further sections, by their id. */
export const toastSectionCode = {
  promise: [promiseCode],
  stack: [stackCode, stackCssCode],
};
