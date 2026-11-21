import type { JSX } from "@solidjs/web";
import { createMemo, createSignal, omit } from "solid-js";

import { createListValue } from "../../core/listValue.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { ToggleGroupRootContext } from "./ToggleGroupRootContext.ts";
import type {
  ToggleGroupItemEntry,
  ToggleGroupRootContextValue,
} from "./ToggleGroupRootContext.ts";

export interface ToggleGroupRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The values of the pressed items, when controlled. */
  value?: string[];
  /** The values of the items pressed at first, when uncontrolled. */
  defaultValue?: string[];
  /**
   * Called with the new values when the user presses or releases an item.
   * When controlled, the group changes only if `value` does.
   */
  onValueChange?: (value: string[]) => void;
  /**
   * Whether several items can be pressed at once. Otherwise pressing an
   * item releases the one pressed before.
   */
  multiple?: boolean;
  /** Whether every item ignores the user. They cannot be focused either. */
  disabled?: boolean;
  /** Whether the items are laid out side by side, or stacked. */
  orientation?: "horizontal" | "vertical";
  render?: RenderProp;
}

// Document order, which can differ from the order items registered in.
const byPosition = (a: ToggleGroupItemEntry, b: ToggleGroupItemEntry) =>
  a.element.compareDocumentPosition(b.element) &
  Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;

/**
 * A set of toggle buttons that share one value: a `<div role="group">`
 * around `ToggleGroup.Item`s, with one tab stop among them.
 */
export function ToggleGroupRoot(props: ToggleGroupRootProps) {
  const pressed = createListValue({
    get value() {
      return props.value;
    },
    get defaultValue() {
      return props.defaultValue;
    },
    get multiple() {
      return props.multiple;
    },
    onChange: (value) => props.onValueChange?.(value),
  });
  const vertical = () => props.orientation === "vertical";

  // The items in the focus order, which register once mounted, and the one
  // that last had focus. The tab stop is that item, or the first enabled
  // one if it has none, is disabled or is gone.
  const [items, setItems] = createSignal<ToggleGroupItemEntry[]>([]);
  const [active, setActive] = createSignal<HTMLElement>();
  const enabledItems = () =>
    items()
      .filter((item) => !item.disabled())
      .sort(byPosition);
  const tabStop = createMemo(() => {
    const enabled = enabledItems();
    return (enabled.find((item) => item.element === active()) ?? enabled[0])
      ?.element;
  });
  let group: HTMLElement | undefined;
  // Whether an item has claimed the tab stop of the server HTML.
  let claimed = false;

  const context: ToggleGroupRootContextValue = {
    pressed: pressed.has,
    press: pressed.set,
    disabled: () => props.disabled,
    // Before any item has registered, as on the server, the first enabled
    // item created has the tab stop, so the server HTML has one too.
    isTabStop: (element, first) =>
      items().length ? !!element && tabStop() === element : first,
    claimTabStop: (disabled) => !disabled && !claimed && (claimed = true),
    register: (item) => {
      setItems((list) => [...list, item]);
      return () => setItems((list) => list.filter((other) => other !== item));
    },
    setActive: (element) => setActive(element),
    navigate: (event, from) => {
      // With a modifier, the keys are the browser's or the app's, such as
      // Alt+Left for back.
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      const enabled = enabledItems();
      const count = enabled.length;
      const index = enabled.findIndex((item) => item.element === from);
      // In a right-to-left horizontal group, the next item is on the left.
      const [previous, next] = vertical()
        ? ["ArrowUp", "ArrowDown"]
        : getComputedStyle(group!).direction === "rtl"
          ? ["ArrowRight", "ArrowLeft"]
          : ["ArrowLeft", "ArrowRight"];
      const target =
        event.key === previous
          ? index - 1
          : event.key === next
            ? index + 1
            : event.key === "Home"
              ? 0
              : event.key === "End"
                ? count - 1
                : undefined;
      if (target === undefined || !count) return;
      // Arrow keys and Home and End would scroll the page.
      event.preventDefault();
      enabled[(target + count) % count].element.focus();
    },
  };

  const ownProps: ElementProps = {
    role: "group",
    // The group role takes no orientation; a toolbar does, horizontal unless
    // it says otherwise.
    get "aria-orientation"() {
      return props.role === "toolbar" && vertical() ? "vertical" : undefined;
    },
    get "data-horizontal"() {
      return vertical() ? undefined : "";
    },
    get "data-vertical"() {
      return vertical() ? "" : undefined;
    },
    get "data-disabled"() {
      return props.disabled ? "" : undefined;
    },
    ref: (element) => {
      group = element;
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
      "multiple",
      "disabled",
      "orientation",
    ),
  );
  return (
    <ToggleGroupRootContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </ToggleGroupRootContext>
  );
}
