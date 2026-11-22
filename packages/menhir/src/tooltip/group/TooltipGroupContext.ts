import { createContext } from "solid-js";

import type { HoverGroup } from "../../floating/hover/group.ts";

// Its own file, holding no code of `hover/group`: a Root reads it whether or
// not a Group is rendered, and only an app that renders one bundles the
// group (README, "Decisions"). `null` outside a Group.
export const TooltipGroupContext = createContext<HoverGroup | null>(null);
