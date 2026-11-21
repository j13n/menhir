import { merge } from "solid-js";

import { twoStateButtonProps } from "./button.ts";
import type { ButtonElementProps, TwoStateButtonState } from "./button.ts";

/**
 * The own props of a part that is a toggle button, a native
 * `<button type="button" aria-pressed>` (WAI-ARIA button pattern): Toggle's
 * Root and Toggle Group's Item. `value` is whether it is pressed. Pass the
 * state as getters, so it is read where the props are used:
 *
 * ```ts
 * const own = toggleButtonProps(
 *   {
 *     get value() { return pressed(); },
 *     get disabled() { return props.disabled; },
 *     setValue: setPressed,
 *   },
 *   "Toggle.Root",
 * );
 * ```
 *
 * `part` names the part in the development warning of a `render` that is
 * not a button.
 */
export function toggleButtonProps(
  state: TwoStateButtonState,
  part: string,
): ButtonElementProps {
  return merge(twoStateButtonProps(state, "aria-pressed", part), {
    get "data-pressed"() {
      return state.value ? "" : undefined;
    },
    get "data-unpressed"() {
      return state.value ? undefined : "";
    },
    get "data-disabled"() {
      return state.disabled ? "" : undefined;
    },
  });
}
