import { checkboxDoc } from "./checkbox";
import { switchDoc } from "./switch";
import { toggleDoc } from "./toggle";
import type { ComponentDoc } from "./types";

/** Every component page's content. Add a component here when its page lands. */
export const componentDocs: ComponentDoc[] = [
  checkboxDoc,
  switchDoc,
  toggleDoc,
];
