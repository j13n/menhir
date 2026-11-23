import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/NavigationMenuExample";
import cssExampleCode from "./css/NavigationMenuExample.tsx?highlight";
import cssCode from "./css/navigation-menu.css?highlight";
import TailwindExample from "./tailwind/NavigationMenuExample";
import tailwindExampleCode from "./tailwind/NavigationMenuExample.tsx?highlight";
import withoutHoverCode from "./without-hover/NavigationWithoutHover.tsx?highlight";

/** The Navigation Menu page's example, with plain CSS and with Tailwind CSS. */
export const navigationMenuExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "NavigationMenuExample.tsx", code: cssExampleCode },
      { name: "navigation-menu.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "NavigationMenuExample.tsx", code: tailwindExampleCode }],
  },
};

/** The code of the Navigation Menu page's further sections, by their id. */
export const navigationMenuSectionCode = {
  "without-hover": withoutHoverCode,
};
