// What the test lists in Menu.tsx and Combobox.tsx share: the options they
// give list navigation, and the element that holds their items.
import type { JSX } from "@solidjs/web";
import { createEffect } from "solid-js";

import type { ListNavigationOptions } from "../../../src/floating/list-navigation/listNavigation.ts";
import type { ListFixtureProps, TestItem } from "./props.ts";

export const defaultItems = ["Apple", "Banana", "Cherry", "Date"];

/** The options of list navigation, read from the fixture's props. */
export function listOptions<T extends TestItem>(
  props: ListFixtureProps,
): ListNavigationOptions<T> {
  return {
    get open() {
      return props.open;
    },
    get orientation() {
      return props.orientation;
    },
    get wrap() {
      return props.wrap;
    },
    reachable: (item) => !props.unreachable?.includes(item.label),
    get onArrowIn() {
      return props.onArrowIn;
    },
    get onArrowOut() {
      return props.onArrowOut;
    },
  };
}

/**
 * The element that holds the items: with `open` given, a `popover="manual"`
 * popup shown while open (or while `shown`); left out, always shown.
 */
export function TestPopup(
  props: Pick<ListFixtureProps, "open" | "shown" | "orientation" | "scroll"> & {
    id?: string;
    role: "menu" | "listbox";
    children: JSX.Element;
  },
) {
  let popup!: HTMLDivElement;
  createEffect(
    () => props.shown ?? props.open,
    (shown) => {
      // jsdom has no popover.
      if (shown === undefined || !("showPopover" in popup)) return;
      if (shown && !popup.matches(":popover-open")) popup.showPopover();
      if (!shown && popup.matches(":popover-open")) popup.hidePopover();
    },
  );
  return (
    <div
      ref={popup}
      id={props.id}
      popover={props.open === undefined ? undefined : "manual"}
      role={props.role}
      aria-label="Fruit"
      aria-orientation={props.orientation}
      style={{
        margin: "0",
        padding: "0",
        inset: "40px auto auto 0",
        width: "200px",
        "max-height": props.scroll ? "75px" : undefined,
        overflow: props.scroll ? "auto" : undefined,
        display:
          props.orientation === "horizontal" && props.open === undefined
            ? "flex"
            : undefined,
      }}
    >
      {props.children}
    </div>
  );
}
