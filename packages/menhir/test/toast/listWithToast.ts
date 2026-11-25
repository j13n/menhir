import { runWithOwner } from "solid-js";

import { createToastManager } from "../../src/toast/index.ts";

/**
 * A list with one toast that stays, made while a component renders: for a
 * conformance suite, whose render function is all it is given. Outside any
 * owner, as an app adds a toast, since a component's body may not write.
 */
export function listWithToast() {
  return runWithOwner(null, () => {
    const toasts = createToastManager();
    toasts.add({ title: "Saved", description: "Stored", duration: Infinity });
    return toasts;
  });
}
