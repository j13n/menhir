import { size as measure } from "@floating-ui/dom";
import type { SizeOptions } from "@floating-ui/dom";

import type { PositionMiddleware } from "./createPosition.ts";

interface Available {
  width: number;
  height: number;
}

function writeAvailable(popup: HTMLElement, available: Available) {
  popup.style.setProperty("--available-width", `${available.width}px`);
  popup.style.setProperty("--available-height", `${available.height}px`);
}

/**
 * Writes the space between the anchor and the viewport's edges, less
 * `padding`, as `--available-width` and `--available-height`, for the
 * popup's `max-width` and `max-height`. Goes after `flip` and `shift`.
 *
 * It writes them while it measures as well, so that a popup they limit is
 * measured at its limited size in the same placement. If that placement
 * turns out stale, `createPosition` writes the newest one again.
 */
export function size(
  options: Omit<SizeOptions, "apply"> = {},
): PositionMiddleware {
  return {
    name: "size",
    options,
    async fn(state) {
      let available: Available | undefined;
      const result = await measure({
        ...options,
        apply({ elements, availableWidth, availableHeight }) {
          available = {
            width: Math.max(0, availableWidth),
            height: Math.max(0, availableHeight),
          };
          writeAvailable(elements.floating, available);
        },
      }).fn(state);
      return { ...result, data: available };
    },
    write: (popup, data) => writeAvailable(popup, data.size),
  };
}
