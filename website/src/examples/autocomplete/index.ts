import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/AutocompleteExample";
import cssExampleCode from "./css/AutocompleteExample.tsx?highlight";
import cssCode from "./css/autocomplete.css?highlight";
import TailwindExample from "./tailwind/AutocompleteExample";
import tailwindExampleCode from "./tailwind/AutocompleteExample.tsx?highlight";

/** The Autocomplete page's example, with plain CSS and with Tailwind CSS. */
export const autocompleteExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "AutocompleteExample.tsx", code: cssExampleCode },
      { name: "autocomplete.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "AutocompleteExample.tsx", code: tailwindExampleCode }],
  },
};
