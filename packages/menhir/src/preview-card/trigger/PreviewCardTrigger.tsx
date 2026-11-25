import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { usePreviewCardRootContext } from "../root/PreviewCardRootContext.ts";

// The default element is an `<a>`, so its attributes are typed here; a
// render function types its own element's.
export interface PreviewCardTriggerProps
  extends
    JSX.HTMLAttributes<HTMLElement>,
    Pick<
      JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
      | "href"
      | "target"
      | "rel"
      | "download"
      | "hreflang"
      | "ping"
      | "referrerpolicy"
      | "type"
    > {
  render?: RenderProp;
}

/**
 * The link the card previews: an `<a>`, which keeps its own press. Hovering
 * it, or keyboard focus on it, opens the card after the Root's `delay`, and
 * a press closes it. Place it inside `PreviewCard.Root`, before
 * `PreviewCard.Popup`.
 */
export function PreviewCardTrigger(props: PreviewCardTriggerProps) {
  const root = usePreviewCardRootContext();
  const ownProps = merge(root.attributes, {
    // Keyboard focus only: a press that focuses the link does not open it
    // (README, "Decisions").
    onFocus: (event: FocusEvent) => {
      if (root.trigger!.matches(":focus-visible")) root.openOnFocus(event);
    },
    onBlur: (event: FocusEvent) =>
      root.closeOnFocusLeaving(event.relatedTarget, {
        reason: "trigger-focus",
        event,
      }),
    // Escape dismisses a card still waiting to open, as it would an open
    // one (WCAG 1.4.13, dismissible): it does not open after the delay.
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Escape") root.cancelFocus();
    },
    // The link navigates, and the card would cover where it went. Hover
    // opens nothing more until the pointer comes onto it again.
    onClick: (event: MouseEvent) => {
      root.pressed = true;
      root.cancelFocus();
      root.setOpen(false, { reason: "trigger-press", event });
    },
    // Added as the element is created, so it runs before hover's own
    // listener, which reads `pressed` through `disabled`.
    onPointerEnter: () => {
      root.pressed = false;
    },
    ref: (element: HTMLElement) => {
      root.trigger = element;
    },
  } satisfies ElementProps);
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <a {...p} />);
}
