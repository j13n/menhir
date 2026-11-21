import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/ThemePicker";
import cssExampleCode from "./css/ThemePicker.tsx?raw";
import cssCode from "./css/theme-picker.css?raw";
import TailwindExample from "./tailwind/ThemePicker";
import tailwindExampleCode from "./tailwind/ThemePicker.tsx?raw";
import themesCode from "./themes.ts?raw";

const themes = { name: "themes.ts", code: themesCode };

/** The Theme page's example, with plain CSS and with Tailwind CSS. */
export const themeExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "ThemePicker.tsx", code: cssExampleCode },
      { name: "theme-picker.css", code: cssCode },
      themes,
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "ThemePicker.tsx", code: tailwindExampleCode }, themes],
  },
};
