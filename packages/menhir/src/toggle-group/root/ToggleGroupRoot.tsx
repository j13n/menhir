import type { JSX } from "@solidjs/web";
import { createSignal, omit } from "solid-js";

import { createListValue } from "../../core/listValue.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { createRovingFocus } from "../../core/rovingFocus.ts";
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

  // The item that last had focus has the tab stop, else the first enabled
  // one.
  const [active, setActive] = createSignal<HTMLElement>();
  const roving = createRovingFocus<ToggleGroupItemEntry>({
    get vertical() {
      return vertical();
    },
    focusable: (item) => !item.disabled(),
    preferred: (item) => item.element === active(),
  });
  // Whether an item has claimed the tab stop of the server HTML.
  let claimed = false;

  const context: ToggleGroupRootContextValue = {
    ...roving,
    pressed: pressed.has,
    press: pressed.set,
    disabled: () => props.disabled,
    // Before any item has registered, as on the server, the first enabled
    // item created has the tab stop, so the server HTML has one too.
    claimTabStop: (disabled) => !disabled && !claimed && (claimed = true),
    setActive: (element) => setActive(element),
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
