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
