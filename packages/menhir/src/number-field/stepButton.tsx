import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { merge, omit, onSettled } from "solid-js";

import { warnUnlessButton } from "../core/button.ts";
import type { ButtonElementProps } from "../core/button.ts";
import { mergeElementProps } from "../core/mergeElementProps.ts";
import { renderElement } from "../core/renderElement.tsx";
import type { RenderProp } from "../core/renderElement.tsx";
import { useNumberFieldRootContext } from "./root/NumberFieldRootContext.ts";

export interface StepButtonProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Renders the button with your own component, which must render a `<button>`. Read once. */
  render?: RenderProp;
}

// How long a press is held before it repeats, and how often it repeats.
const holdDelay = 400;
const repeatInterval = 60;

/**
 * Increment or Decrement: a `<button type="button" tabindex="-1">` that
 * steps the value that way on a click, and again and again while a pointer
 * holds it. It never takes focus, and is disabled at its limit.
 */
export function renderStepButton(
  props: StepButtonProps,
  direction: 1 | -1,
  part: string,
): JSX.Element {
  const root = useNumberFieldRootContext();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stop = () => clearTimeout(timer);
  // Steps, then again after the delay, and then at each interval, until
  // the press ends or the button is disabled at its limit.
  const repeat = (delay: number) => {
    root.step(direction);
    timer = setTimeout(() => {
      if (root.canStep(direction)) repeat(repeatInterval);
    }, delay);
  };
  onSettled(() => stop);

  const ownProps = merge(root.attributes, {
    type: "button",
    tabindex: -1,
    get disabled() {
      return !root.canStep(direction);
    },
    get "aria-controls"() {
      return root.inputId();
    },
    onPointerDown: (event: PointerEvent) => {
      if (event.button !== 0) return;
      // The button never takes focus: the keys go on in the Input. A mouse
      // press focuses the Input; a touch does not, which would open the
      // on-screen keyboard.
      event.preventDefault();
      if (event.pointerType === "mouse") root.input?.focus();
      const button = event.currentTarget as HTMLElement;
      // The release may land outside the button.
      button.setPointerCapture?.(event.pointerId);
      repeat(holdDelay);
    },
    onPointerUp: stop,
    onPointerCancel: stop,
    onLostPointerCapture: stop,
    onClick: (event: MouseEvent) => {
      // A click with no pointer press before it, from a screen reader or
      // voice control, steps once. A pointer's click stepped on its press.
      if (event.detail === 0) root.step(direction);
    },
    ref: (element: HTMLElement) => {
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, part);
    },
  } satisfies ButtonElementProps & { tabindex: number });
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
