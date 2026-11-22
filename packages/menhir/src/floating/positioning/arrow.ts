import { arrow as measure } from "@floating-ui/dom";
import type { Padding } from "@floating-ui/dom";

import type { PositionMiddleware } from "./createPosition.ts";

/**
 * Places `element`, an absolutely positioned child of the popup, so that it
 * points at the anchor's center: its `left` on the top and bottom sides,
 * its `top` on the left and right. `padding` keeps it that far from the
 * popup's corners. The other offset, out of the popup's edge, is the
 * consumer's CSS, by `data-side`. Goes after `shift`.
 */
export function arrow(options: {
  element: HTMLElement;
  padding?: Padding;
}): PositionMiddleware {
  return {
    ...measure(options),
    write(_popup, data) {
      // Set by this middleware, which ran before its write.
      const { x, y } = data.arrow!;
      const style = options.element.style;
      style.left = x == null ? "" : `${x}px`;
      style.top = y == null ? "" : `${y}px`;
    },
  };
}
