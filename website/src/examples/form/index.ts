import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/FormExample";
import cssExampleCode from "./css/FormExample.tsx?highlight";
import cssCode from "./css/form.css?highlight";
import schemaOnSubmitCode from "./schema-on-submit/FormWithSchema.tsx?highlight";
import serverErrorsCode from "./server-errors/FormServerErrors.tsx?highlight";
import TailwindExample from "./tailwind/FormExample";
import tailwindExampleCode from "./tailwind/FormExample.tsx?highlight";

/** The Form page's example, with plain CSS and with Tailwind CSS. */
export const formExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "FormExample.tsx", code: cssExampleCode },
      { name: "form.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "FormExample.tsx", code: tailwindExampleCode }],
  },
};

/** The code of the Form page's further sections, by their id. */
export const formSectionCode = {
  "schema-on-submit": schemaOnSubmitCode,
  "server-errors": serverErrorsCode,
};
