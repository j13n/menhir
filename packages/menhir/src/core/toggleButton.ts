import { isDev } from "@solidjs/web";

import { warnUnlessButton } from "./button.ts";
import type { ButtonElementProps } from "./button.ts";

/** The state of a toggle button, as getters read where they are used. */
export interface ToggleButtonState {
  readonly pressed: boolean;
  readonly disabled: boolean | undefined;
  /** Called by a click, with the opposite of `pressed`. */
  setPressed(pressed: boolean): void;
}

/**
 * The own props of a part that is a toggle button, a native
 * `<button type="button" aria-pressed>` (WAI-ARIA button pattern): Toggle's
 * Root and Toggle Group's Item. Pass the state as getters, so it is read
 * where the props are used:
 *
 * ```ts
 * const own = toggleButtonProps(
 *   {
 *     get pressed() { return pressed(); },
 *     get disabled() { return props.disabled; },
 *     setPressed,
 *   },
 *   "Toggle.Root",
 * );
 * ```
 *
 * `part` names the part in the development warning of a `render` that is
 * not a button.
 */
export function toggleButtonProps(
  state: ToggleButtonState,
  part: string,
): ButtonElementProps {
  return {
    type: "button",
    get disabled() {
      return state.disabled;
    },
    // Solid 2.0 removes an attribute set to false, so spell the value out.
    get "aria-pressed"() {
      return state.pressed ? "true" : "false";
    },
    get "data-pressed"() {
      return state.pressed ? "" : undefined;
    },
    get "data-unpressed"() {
      return state.pressed ? undefined : "";
    },
    get "data-disabled"() {
      return state.disabled ? "" : undefined;
    },
    onClick: () => state.setPressed(!state.pressed),
    ref: (element) => {
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, part);
    },
  };
}
