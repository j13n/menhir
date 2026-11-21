import type { ComponentExampleProps } from "../../components/ComponentExample";

import iconCode from "./ColorSchemeIcon.tsx?highlight";
import CssExample from "./css/ColorSchemeToggle";
import cssExampleCode from "./css/ColorSchemeToggle.tsx?highlight";
import cssCode from "./css/color-scheme-toggle.css?highlight";
import TailwindExample from "./tailwind/ColorSchemeToggle";
import tailwindExampleCode from "./tailwind/ColorSchemeToggle.tsx?highlight";

const icon = { name: "ColorSchemeIcon.tsx", code: iconCode };

/**
 * The Color Scheme page's example, with plain CSS and with Tailwind CSS. The
 * Tailwind one is also the toggle in the site's header.
 */
export const colorSchemeExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "ColorSchemeToggle.tsx", code: cssExampleCode },
      { name: "color-scheme-toggle.css", code: cssCode },
      icon,
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "ColorSchemeToggle.tsx", code: tailwindExampleCode }, icon],
  },
};
