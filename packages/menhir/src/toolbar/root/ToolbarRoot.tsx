import type { JSX } from "@solidjs/web";
import { createSignal, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { createRovingFocus } from "../../core/rovingFocus.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { ToolbarRootContext } from "./ToolbarRootContext.ts";
import type {
  ToolbarItemEntry,
  ToolbarRootContextValue,
} from "./ToolbarRootContext.ts";

export interface ToolbarRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Whether the controls are laid out side by side, or stacked. */
  orientation?: "horizontal" | "vertical";
  /**
   * Whether every item ignores the user. They stay focusable, so that a
   * screen reader user finds them.
   */
  disabled?: boolean;
  render?: RenderProp;
}

/**
 * A row of controls that is one tab stop, with arrow keys between them: a
 * `<div role="toolbar">` around `Toolbar.Button`, `Toolbar.Link` and
 * `Toolbar.Input` items. A control of another component joins as an
 * item's `render`.
 */
export function ToolbarRoot(props: ToolbarRootProps) {
  const vertical = () => props.orientation === "vertical";

  // The item that last had focus has the tab stop, else the first one that
  // is not disabled, else the first.
  const [active, setActive] = createSignal<HTMLElement>();
  const roving = createRovingFocus<ToolbarItemEntry>({
    get vertical() {
      return vertical();
    },
    // Toolbar's disabled items stay focusable; one disabled natively, such
    // as a joined control's own `disabled`, cannot take focus.
    focusable: (item) => !item.element.matches(":disabled"),
    preferred: (item) =>
      active() ? item.element === active() : !item.disabled(),
  });
  // Whether an item has claimed the tab stop of the server HTML.
  let claimed = false;
  // The items by element, for the listeners below.
  const items = new Map<EventTarget, ToolbarItemEntry>();

  const context: ToolbarRootContextValue = {
    register: (item) => {
      const unregister = roving.register(item);
      items.set(item.element, item);
      return () => {
        unregister();
        items.delete(item.element);
        // The first item that is not disabled takes over.
        if (active() === item.element) setActive(undefined);
      };
    },
    isTabStop: roving.isTabStop,
    disabled: () => props.disabled,
    // Before any item has registered, as on the server, the first item
    // created that is not disabled has the tab stop, or the first item of
    // a disabled toolbar.
    claimTabStop: (disabled) =>
      (!disabled || !!props.disabled) && !claimed && (claimed = true),
    setActive: (element) => setActive(element),
  };

  // In the capture phase, before any control: the toolbar's keys are its
  // own, and a disabled item gets no key that would act (README,
  // "Decisions"). Only keys pressed on an item count, not those of a menu
  // open inside the toolbar.
  const onKeyDown = (event: KeyboardEvent) => {
    const item = items.get(event.target!);
    if (!item) return;
    const { element } = item;
    const { key } = event;
    // Right to left, the next item is on the left. `direction` inherits,
    // so the item's own is the toolbar's. A copy of `navigate`'s in
    // core/rovingFocus.ts, which a helper shared from there would grow
    // Tabs and Toggle Group by 6 B (README, "Size"); change both together.
    const [previous, next] = vertical()
      ? ["ArrowUp", "ArrowDown"]
      : getComputedStyle(element).direction === "rtl"
        ? ["ArrowRight", "ArrowLeft"]
        : ["ArrowLeft", "ArrowRight"];
    const step =
      key === previous
        ? -1
        : key === next
          ? 1
          : key === "Home" || key === "End"
            ? 0
            : undefined;
    if (
      step !== undefined &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      // A control that names its active item keeps focus while its popup
      // is open, as a Select's Trigger does, and keeps every key.
      !element.hasAttribute("aria-activedescendant") &&
      !item.keeps?.(element, step)
    ) {
      roving.navigate(event, element);
      // The control does not act on the key too: a Toggle Group's item
      // would move focus again.
      event.stopPropagation();
      const to = items.get(document.activeElement!);
      to?.enter?.(to.element, key === previous || key === "End");
    } else if (
      item.disabled() &&
      key !== "Tab" &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.stopPropagation();
      // Enter would click a button, or submit a text field's form.
      if (key === "Enter") event.preventDefault();
    }
  };
  // A click on a disabled item, or inside it, reaches none of its handlers
  // and does nothing, whatever the control; a middle click does not open a
  // link either.
  const onClick = (event: MouseEvent) => {
    for (
      let node = event.target as Node | null;
      node && node !== event.currentTarget;
      node = node.parentNode
    ) {
      const item = items.get(node);
      if (item) {
        if (item.disabled()) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
    }
  };

  const ownProps: ElementProps = {
    role: "toolbar",
    // Horizontal is the role's own, so it is written only when vertical.
    get "aria-orientation"() {
      return vertical() ? "vertical" : undefined;
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
    // Solid has no capture-phase handlers, and delegates its own to the
    // root of the app, which the event then never reaches.
    ref: (element) => {
      element.addEventListener("keydown", onKeyDown, true);
      element.addEventListener("click", onClick, true);
      element.addEventListener("auxclick", onClick, true);
    },
  };
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "orientation", "disabled"),
  );
  return (
    <ToolbarRootContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </ToolbarRootContext>
  );
}
