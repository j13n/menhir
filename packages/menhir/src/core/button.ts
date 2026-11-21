import { isDev } from "@solidjs/web";

import type { ElementProps } from "./renderElement.tsx";

/**
 * The own props of a part that is a native button (PLAN.md section 8, "Form
 * controls are native buttons"). `type` and `disabled` are button
 * attributes, which `ElementProps`, typed for any element, does not list.
 */
export type ButtonElementProps = ElementProps & {
  type: "button";
  disabled?: boolean;
};

/**
 * Warns when the consumer's `render` function rendered a part that must be
 * a native button as another element: its keyboard support, focus and name
 * come from the element being a button. Call it from the part's ref behind
 * `isDev`, so that production builds drop the call and this module:
 *
 * ```ts
 * ref: (element) => {
 *   if (isDev) warnUnlessButton(element, "Switch.Root");
 * },
 * ```
 */
export function warnUnlessButton(element: HTMLElement, part: string): void {
  if (element.tagName === "BUTTON") return;
  console.warn(
    `[menhir] ${part}'s render function rendered a <${element.tagName.toLowerCase()}>. ` +
      "Render a <button>, which gives the part its keyboard support, focus and name.",
  );
}

/** The state of a two-state button, as getters read where they are used. */
export interface TwoStateButtonState {
  readonly value: boolean;
  readonly disabled: boolean | undefined;
  /** Called by a click, with the opposite of `value`. */
  setValue(value: boolean): void;
}

/**
 * The own props of a part that is a native `<button type="button">` whose
 * click flips a state it announces in `attribute`: `aria-pressed` on a
 * toggle button (`toggleButton.ts`), `aria-expanded` on a disclosure's
 * trigger. Pass the state as getters, so it is read where the props are
 * used:
 *
 * ```ts
 * const own = twoStateButtonProps(
 *   {
 *     get value() { return open(); },
 *     get disabled() { return props.disabled; },
 *     setValue: setOpen,
 *   },
 *   "aria-expanded",
 *   "Collapsible.Trigger",
 * );
 * ```
 *
 * `part` names the part in the development warning of a `render` that is
 * not a button. The part adds its own `data-*` attributes.
 */
export function twoStateButtonProps(
  state: TwoStateButtonState,
  attribute: "aria-pressed" | "aria-expanded",
  part: string,
): ButtonElementProps {
  // A computed key widens the literal's type to an index signature, which
  // TypeScript then checks against every attribute.
  return {
    type: "button",
    get disabled() {
      return state.disabled;
    },
    // Solid 2.0 removes an attribute set to false, so spell the value out.
    get [attribute]() {
      return state.value ? "true" : "false";
    },
    onClick: () => state.setValue(!state.value),
    ref: (element) => {
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, part);
    },
  } as ButtonElementProps;
}
