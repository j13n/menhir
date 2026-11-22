// A test popup for createPosition, shared by its tests and the hydration
// fixture: an anchor button and a `popover="manual"` element, shown by an
// effect created before createPosition, as a popup component does.
import type { JSX } from "@solidjs/web";
import { createEffect, untrack } from "solid-js";

import {
  createPosition,
  type Align,
  type Position,
  type PositionMiddleware,
  type Side,
  type VirtualElement,
} from "../../../src/floating/positioning/createPosition.ts";

export interface PopupProps {
  open: boolean;
  side?: Side;
  align?: Align;
  middleware?: PositionMiddleware[];
  /** Placed against this instead of the button. */
  virtualAnchor?: VirtualElement;
  anchorStyle?: JSX.CSSProperties;
  popupStyle?: JSX.CSSProperties;
  /** Rendered inside the popup, such as an arrow. */
  children?: JSX.Element;
  /** Receives the elements once rendered. */
  ref?: (elements: { anchor: HTMLElement; popup: HTMLElement }) => void;
  /** Receives the reactive position, for a test to read. */
  position?: (position: () => Position | undefined) => void;
}

/** A fixed 40 by 20 anchor at (100, 100) and a 100 by 50 popup by default. */
export function Popup(props: PopupProps) {
  let anchor: HTMLButtonElement | undefined;
  let popup: HTMLDivElement | undefined;
  createEffect(
    () => props.open,
    (open) => {
      // jsdom has no popover, and no layout to place it in either.
      if (!("showPopover" in popup!)) return;
      if (open) popup!.showPopover();
      else if (popup!.matches(":popover-open")) popup!.hidePopover();
    },
  );
  const position = createPosition({
    get anchor() {
      return props.virtualAnchor ?? anchor;
    },
    get popup() {
      return popup;
    },
    get open() {
      return props.open;
    },
    get side() {
      return props.side;
    },
    get align() {
      return props.align;
    },
    get middleware() {
      return props.middleware;
    },
  });
  untrack(() => props.position)?.(position);
  return (
    <>
      <button
        ref={(el) => (anchor = el)}
        style={{
          position: "fixed",
          left: "100px",
          top: "100px",
          width: "40px",
          height: "20px",
          margin: 0,
          padding: 0,
          border: 0,
          ...props.anchorStyle,
        }}
      >
        Anchor
      </button>
      <div
        ref={(el) => {
          popup = el;
          props.ref?.({ anchor: anchor!, popup: el });
        }}
        popover="manual"
        data-testid="popup"
        style={{
          width: "100px",
          height: "50px",
          // The browser's own `margin: auto` stays: it resolves to 0 once
          // `right` and `bottom` are `auto`.
          padding: 0,
          border: 0,
          ...props.popupStyle,
        }}
      >
        {props.children}
      </div>
    </>
  );
}
