import type { JSX } from "@solidjs/web";
import { createSignal, createUniqueId, omit } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { createRovingFocus } from "../../core/rovingFocus.ts";
import { TabsRootContext } from "./TabsRootContext.ts";
import type { TabsRootContextValue, TabsTabEntry } from "./TabsRootContext.ts";

export interface TabsRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The selected tab's value, when controlled; `null` selects none. */
  value?: string | null;
  /**
   * The value of the tab selected at first, when uncontrolled. Without
   * one, the first enabled tab is selected.
   */
  defaultValue?: string;
  /**
   * Called with the new value when the user selects a tab. When
   * controlled, the selection changes only if `value` does.
   */
  onValueChange?: (value: string) => void;
  /** Whether the tabs are laid out side by side, or stacked. */
  orientation?: "horizontal" | "vertical";
  /**
   * Whether a tab is selected when it receives focus (`"automatic"`), or
   * only by click, Enter or Space (`"manual"`), for panels that load their
   * content.
   */
  activation?: "automatic" | "manual";
  render?: RenderProp;
}

/**
 * Layered sections of content, one shown at a time: a `<div>` around a
 * `Tabs.List` of `Tabs.Tab`s and their `Tabs.Panel`s.
 */
export function TabsRoot(props: TabsRootProps) {
  const [value, setValue] = createControllableSignal<string | null | undefined>(
    {
      get value() {
        return props.value;
      },
      get defaultValue() {
        return props.defaultValue;
      },
      onChange: (value) => props.onValueChange?.(value!),
    },
  );
  // The first enabled tab created, selected while there is no value. Tabs
  // are created before anything reads the selection, on the server too.
  let first: string | undefined;
  const selected = () => {
    const current = value();
    return current === undefined ? first : current;
  };
  const vertical = () => props.orientation === "vertical";
  const id = createUniqueId();
  // The tab stop is the tab that has focus, so Tab from it moves on to the
  // panel, else the selected tab, which Tab into the list focuses.
  const [focused, setFocused] = createSignal<HTMLElement>();
  const roving = createRovingFocus<TabsTabEntry>({
    get vertical() {
      return vertical();
    },
    // Disabled tabs stay focusable (README, "Shape").
    focusable: () => true,
    preferred: (tab) =>
      focused() ? tab.element === focused() : selected() === tab.value(),
  });

  const context: TabsRootContextValue = {
    ...roving,
    selected: (tab) => selected() === tab,
    // The tab selected by default is not in `value`, which would report it
    // as a change.
    select: (tab) => {
      if (selected() !== tab) setValue(tab);
    },
    claimFirst: (tab, disabled) => {
      if (!disabled) first ??= tab;
    },
    vertical,
    automatic: () => props.activation !== "manual",
    generatedTabId: (tab) => `${id}-tab-${tab}`,
    tabId: (tab) => context.tabIds[tab]?.() ?? context.generatedTabId(tab),
    tabIds: {},
    panelId: (tab) => `${id}-panel-${tab}`,
    setFocused: (element) => setFocused(element),
  };

  const ownProps: ElementProps = {
    get "data-horizontal"() {
      return vertical() ? undefined : "";
    },
    get "data-vertical"() {
      return vertical() ? "" : undefined;
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
      "orientation",
      "activation",
    ),
  );
  return (
    <TabsRootContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </TabsRootContext>
  );
}
