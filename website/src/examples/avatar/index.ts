import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/AvatarExample";
import cssExampleCode from "./css/AvatarExample.tsx?highlight";
import cssCode from "./css/avatar.css?highlight";
import TailwindExample from "./tailwind/AvatarExample";
import tailwindExampleCode from "./tailwind/AvatarExample.tsx?highlight";
import tailwindCssCode from "./tailwind/avatar-wait.css?highlight";

/** The Avatar page's example, with plain CSS and with Tailwind CSS. */
export const avatarExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "AvatarExample.tsx", code: cssExampleCode },
      { name: "avatar.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [
      { name: "AvatarExample.tsx", code: tailwindExampleCode },
      { name: "avatar-wait.css", code: tailwindCssCode },
    ],
  },
};
