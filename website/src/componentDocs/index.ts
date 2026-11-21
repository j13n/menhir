import { checkboxDoc } from "./checkbox";
import { separatorDoc } from "./separator";
import { switchDoc } from "./switch";
import { toggleDoc } from "./toggle";
import type { ComponentDoc } from "./types";

/** Every component page's content. Add a component here when its page lands. */
export const componentDocs: ComponentDoc[] = [
  checkboxDoc,
  separatorDoc,
  switchDoc,
  toggleDoc,
];
