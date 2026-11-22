import { accordionDoc } from "./accordion";
import { checkboxDoc } from "./checkbox";
import { collapsibleDoc } from "./collapsible";
import { dialogDoc } from "./dialog";
import { meterDoc } from "./meter";
import { progressDoc } from "./progress";
import { separatorDoc } from "./separator";
import { switchDoc } from "./switch";
import { tabsDoc } from "./tabs";
import { toggleDoc } from "./toggle";
import { toggleGroupDoc } from "./toggle-group";
import type { ComponentDoc } from "./types";

/** Every component page's content. Add a component here when its page lands. */
export const componentDocs: ComponentDoc[] = [
  accordionDoc,
  checkboxDoc,
  collapsibleDoc,
  dialogDoc,
  meterDoc,
  progressDoc,
  separatorDoc,
  switchDoc,
  tabsDoc,
  toggleDoc,
  toggleGroupDoc,
];
