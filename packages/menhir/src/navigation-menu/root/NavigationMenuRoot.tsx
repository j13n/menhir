import type { JSX } from "@solidjs/web";
import { createEffect, omit } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";
import { NavigationMenuRootContext } from "./NavigationMenuRootContext.ts";
import type { NavigationMenuRootContextValue } from "./NavigationMenuRootContext.ts";

export interface NavigationMenuRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The open Item's value, `null` when none is open, when controlled. */
  value?: string | null;
  /** The value of the Item open at first, when uncontrolled. */
  defaultValue?: string | null;
  /**
   * Called with the new value, and why, when the user opens or closes an
   * Item. When controlled, the menu changes only if `value` does.
   */
  onValueChange?: (value: string | null, details: OpenChangeDetails) => void;
  /**
   * How long the pointer rests on a Trigger before its Panel opens, in
   * milliseconds. Default 300. While an Item is open, or within `timeout`
   * of the last close, the next opens at once.
   */
  delay?: number;
  /**
   * How long after the pointer has left a Trigger and its Panel the Panel
   * closes, in milliseconds. Default 200.
   */
  closeDelay?: number;
  /**
   * How long after the last close hovering a Trigger still opens its Panel
   * at once, in milliseconds. Default 400.
   */
  timeout?: number;
  render?: RenderProp;
}

/**
 * A site's navigation: a `<nav>` that holds which `NavigationMenu.Item` is
 * open, one at a time. Focus moving out of it, and a press outside it,
 * close the open Item.
 */
export function NavigationMenuRoot(props: NavigationMenuRootProps) {
  // `requested` counts a change asked for earlier in the same turn, which
  // `value` shows only after the flush: two pointer events of one move may
  // ask twice.
  const [value, setValue, requested] = createControllableSignal<
    string | null,
    OpenChangeDetails
  >({
    get value() {
      return props.value;
    },
    get defaultValue() {
      return props.defaultValue ?? null;
    },
    onChange: (next, details) => props.onValueChange?.(next, details),
  });
  // The Item a press opened, whose Panel hover does not close (README,
  // "Decisions").
  let pressedItem: string | null = null;
  // When an Item last closed, for `timeout`.
  let closedAt = -Infinity;
  const set = (next: string | null, details: OpenChangeDetails) => {
    if (next === null && requested() !== null) closedAt = Date.now();
    pressedItem = null;
    setValue(next, details);
  };
  const close = (details: OpenChangeDetails) => set(null, details);
  let nav: HTMLElement | undefined;
  const inside = (target: EventTarget | null) =>
    !!target && !!nav?.contains(target as Node);

  // Whether a primary press started outside and has not ended in a `click`
  // or been cancelled yet. Focus that such a press moves out of the `<nav>`
  // is left to the press, so it closes on release as `outside-press`.
  let pressOutside = false;
  // A press outside closes on release, the `click` of a press that also
  // started outside, so a text selection dragged out of a Panel, a
  // secondary button and a key's `click` close nothing (README).
  createEffect(
    () => value() !== null,
    (open) => {
      if (!open) return;
      const down = (event: PointerEvent) => {
        pressOutside = event.button === 0 && !inside(event.target);
      };
      const cancel = () => {
        pressOutside = false;
      };
      const click = (event: MouseEvent) => {
        if (pressOutside && !inside(event.target))
          close({ reason: "outside-press", event });
        pressOutside = false;
      };
      document.addEventListener("pointerdown", down, true);
      document.addEventListener("pointercancel", cancel, true);
      document.addEventListener("click", click, true);
      return () => {
        cancel();
        document.removeEventListener("pointerdown", down, true);
        document.removeEventListener("pointercancel", cancel, true);
        document.removeEventListener("click", click, true);
      };
    },
  );

  const context: NavigationMenuRootContextValue = {
    value,
    toggle: (item, event) => {
      const next = requested() === item ? null : item;
      set(next, { reason: "trigger-press", event });
      pressedItem = next;
    },
    hoverOpen: set,
    hoverClose: (item, details) => {
      if (requested() === item && pressedItem !== item) close(details);
    },
    close,
    hoverDelay: () =>
      requested() !== null || Date.now() - closedAt < (props.timeout ?? 400)
        ? 0
        : (props.delay ?? 300),
    closeDelay: () => props.closeDelay ?? 200,
  };
  const ownProps: ElementProps = {
    // Focus moving to an element outside closes; focus lost to nothing,
    // such as the window's, does not, and focus that a press outside moves
    // closes on its release (README, "Decisions").
    onFocusOut: (event: FocusEvent) => {
      if (event.relatedTarget && !inside(event.relatedTarget) && !pressOutside)
        close({ reason: "focus-out", event });
    },
    ref: (element: HTMLElement) => {
      nav = element;
    },
  };
  const elementProps = mergeElementProps(
    ownProps,
    omit(
      props,
      "render",
      "value",
      "defaultValue",
      "onValueChange",
      "delay",
      "closeDelay",
      "timeout",
    ),
  );
  return (
    <NavigationMenuRootContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <nav {...p} />
      ))}
    </NavigationMenuRootContext>
  );
}
