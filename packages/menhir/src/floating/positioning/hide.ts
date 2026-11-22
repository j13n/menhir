import { hide as measure } from "@floating-ui/dom";
import type { HideOptions } from "@floating-ui/dom";

import type { PositionMiddleware } from "./createPosition.ts";

/**
 * Sets `data-anchor-hidden` on the popup while its anchor is scrolled out
 * of view, clipped by a scrolling ancestor, so that the consumer's CSS can
 * hide the popup too. Goes last.
 */
export function hide(
  options: Omit<HideOptions, "strategy"> = {},
): PositionMiddleware {
  return {
    ...measure(options),
    write: (popup, data) =>
      popup.toggleAttribute("data-anchor-hidden", !!data.hide?.referenceHidden),
  };
}
