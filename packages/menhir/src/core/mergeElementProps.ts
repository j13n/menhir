import type { JSX } from "@solidjs/web";
import { merge } from "solid-js";

import type { ElementProps } from "./renderElement.tsx";

export type Handler =
  ((event: Event) => void) | [(data: unknown, event: Event) => void, unknown];

/**
 * Calls a JSX event handler in either of Solid's forms, a function or a
 * `[handler, data]` pair, for a part that calls the consumer's handler
 * itself instead of through the merge, such as a menu item that skips it
 * while disabled.
 */
export function callHandler(handler: Handler | undefined, event: Event) {
  if (typeof handler === "function") handler(event);
  else if (handler) handler[0](handler[1], event);
}

type Style = ElementProps["style"];

function toCss(style: Style): string {
  if (typeof style === "string") return style;
  if (!style) return "";
  return Object.entries(style)
    .filter(([, value]) => value != null)
    .map(([name, value]) => `${name}:${value}`)
    .join(";");
}

// Two objects merge by property. If either is a string, both become
// declarations in one string, the consumer's last, so they win a conflict.
function mergeStyles(own: Style, consumer: Style): Style {
  if (consumer == null) return own;
  if (typeof own === "object" && typeof consumer === "object") {
    return { ...own, ...consumer };
  }
  const ownCss = toCss(own);
  const consumerCss = toCss(consumer);
  return ownCss && consumerCss
    ? `${ownCss};${consumerCss}`
    : ownCss || consumerCss;
}

// A consumer's ref is a callback, or an array of refs. A `let` variable
// reaches the part as a callback, written by the compiler.
function applyRef(ref: JSX.Ref<HTMLElement>, element: HTMLElement) {
  if (typeof ref === "function") ref(element);
  else if (Array.isArray(ref))
    for (const entry of ref) applyRef(entry, element);
}

/**
 * Merges a part's own props with the consumer's, for one element. The
 * consumer's props win, except for these, where both apply:
 *
 * - Event handlers both run, the consumer's first.
 * - `class` keeps both, in any of Solid's class forms.
 * - `style` keeps both; the consumer's wins a conflict.
 * - `ref` runs both, the consumer's first. The result's `ref` is one
 *   callback, so it spreads onto any element (see `ElementProps`).
 *
 * Only keys the part sets are merged this way; any other prop of the
 * consumer passes through unchanged. The part's handlers and ref are read
 * once, here; its other props, and all of the consumer's, are read where
 * they are used, so they stay reactive. Call it in the part's body, not
 * inline in a spread, which would run it again on every change.
 */
export function mergeElementProps(
  own: ElementProps,
  props: JSX.HTMLAttributes<HTMLElement>,
): ElementProps {
  const overrides: Record<string, unknown> = {};
  if ("class" in own) {
    // Solid's class array form merges its entries, whatever form each is.
    Object.defineProperty(overrides, "class", {
      enumerable: true,
      get: () => [own.class, props.class],
    });
  }
  if ("style" in own) {
    Object.defineProperty(overrides, "style", {
      enumerable: true,
      get: () => mergeStyles(own.style, props.style),
    });
  }
  // Always one callback, even when only the consumer has a ref, which may
  // be an array: `ElementProps` promises a callback.
  const ownRef = own.ref;
  overrides.ref = (element: HTMLElement) => {
    applyRef(props.ref, element);
    ownRef?.(element);
  };
  for (const key of Object.keys(own)) {
    if (!key.startsWith("on")) continue;
    const ownHandler = own[key as keyof ElementProps] as Handler;
    // The consumer's handler is read when the event fires, so a handler
    // passed as an expression is current without tracking anything.
    overrides[key] = (event: Event) => {
      callHandler(
        props[key as keyof typeof props] as Handler | undefined,
        event,
      );
      callHandler(ownHandler, event);
    };
  }
  return merge(own, props, overrides) as ElementProps;
}
