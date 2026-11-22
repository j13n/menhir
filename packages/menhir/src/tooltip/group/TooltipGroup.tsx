import type { JSX } from "@solidjs/web";

import { createHoverGroup } from "../../floating/hover/group.ts";
import { TooltipGroupContext } from "./TooltipGroupContext.ts";

export interface TooltipGroupProps {
  /**
   * How long the pointer rests on a Trigger before its tooltip opens, in
   * milliseconds, for the Roots inside that set no `delay`. Default 600.
   */
  delay?: number;
  /**
   * How long after the last tooltip of the group closed the next still
   * opens at once, in milliseconds. Default 400.
   */
  timeout?: number;
  children?: JSX.Element;
}

/**
 * A delay group, such as the tooltips of a toolbar: once one tooltip inside
 * is open, hovering another Trigger opens its tooltip at once and closes
 * the first. Renders no element of its own.
 */
export function TooltipGroup(props: TooltipGroupProps) {
  const group = createHoverGroup({
    get delay() {
      return props.delay;
    },
    get timeout() {
      return props.timeout;
    },
  });
  return (
    <TooltipGroupContext value={group}>{props.children}</TooltipGroupContext>
  );
}
