import type { ComponentExampleProps } from "../../components/ComponentExample";

import iconCode from "./ColorModeIcon.tsx?highlight";
import CssExample from "./css/ColorModeToggle";
import cssExampleCode from "./css/ColorModeToggle.tsx?highlight";
import cssCode from "./css/color-mode-toggle.css?highlight";
import TailwindExample from "./tailwind/ColorModeToggle";
import tailwindExampleCode from "./tailwind/ColorModeToggle.tsx?highlight";

const icon = { name: "ColorModeIcon.tsx", code: iconCode };

/**
 * The Color Mode page's example, with plain CSS and with Tailwind CSS. The
 * Tailwind one is also the toggle in the site's header.
 */
export const colorModeExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "ColorModeToggle.tsx", code: cssExampleCode },
      { name: "color-mode-toggle.css", code: cssCode },
      icon,
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "ColorModeToggle.tsx", code: tailwindExampleCode }, icon],
  },
};
