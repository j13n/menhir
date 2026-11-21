import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { warnUnlessButton } from "../../core/button.ts";
import type { ButtonElementProps } from "../../core/button.ts";
import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";

export interface ToggleRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Whether the toggle is pressed, when controlled. */
  pressed?: boolean;
  /** Whether the toggle starts pressed, when uncontrolled. */
  defaultPressed?: boolean;
  /**
   * Called with the new value when the user presses or releases the
   * toggle. When controlled, the toggle changes only if `pressed` does.
   */
  onPressedChange?: (pressed: boolean) => void;
  /** Whether the toggle ignores the user. It cannot be focused either. */
  disabled?: boolean;
  render?: RenderProp;
}

/**
 * The toggle button itself: a `<button aria-pressed>`.
 */
export function ToggleRoot(props: ToggleRootProps) {
  const [pressed, setPressed] = createControllableSignal({
    get value() {
      return props.pressed;
    },
    get defaultValue() {
      return props.defaultPressed ?? false;
    },
    onChange: (value) => props.onPressedChange?.(value),
  });
  const buttonProps: ButtonElementProps = {
    type: "button",
    get disabled() {
      return props.disabled;
    },
    // Solid 2.0 removes an attribute set to false, so spell the value out.
    get "aria-pressed"() {
      return pressed() ? "true" : "false";
    },
    get "data-pressed"() {
      return pressed() ? "" : undefined;
    },
    get "data-unpressed"() {
      return pressed() ? undefined : "";
    },
    get "data-disabled"() {
      return props.disabled ? "" : undefined;
    },
    onClick: () => setPressed(!pressed()),
    ref: (element) => {
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, "Toggle.Root");
    },
  };
  const elementProps = mergeElementProps(
    buttonProps,
    omit(
      props,
      "render",
      "pressed",
      "defaultPressed",
      "onPressedChange",
      "disabled",
    ),
  );
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
