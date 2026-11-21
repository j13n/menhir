import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { omit, onSettled, untrack } from "solid-js";

import { warnUnlessButton } from "../../core/button.ts";
import type { ButtonElementProps } from "../../core/button.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useTabsRootContext } from "../root/TabsRootContext.ts";

export interface TabsTabProps extends JSX.HTMLAttributes<HTMLElement> {
  /**
   * Identifies the tab in the Root's value, and its `Tabs.Panel`. Part of
   * both ids, so it must not contain spaces.
   */
  value: string;
  /**
   * Whether the tab cannot be selected. It stays focusable, with
   * `aria-disabled`, so that the user can still find it.
   */
  disabled?: boolean;
  render?: RenderProp;
}

/**
 * One tab, which shows its `Tabs.Panel` when selected: a
 * `<button role="tab" aria-selected>`. Place it inside `Tabs.List`.
 */
export function TabsTab(props: TabsTabProps) {
  const root = useTabsRootContext();
  let element: HTMLElement | undefined;
  const selected = () => root.selected(props.value);
  const select = () => {
    if (!props.disabled) root.select(props.value);
  };
  // Read once, as the tab is created: the key its Panel finds its id by,
  // and whether it is the one selected when the Root has no value.
  const value = untrack(() => props.value);
  root.claimFirst(
    value,
    untrack(() => !!props.disabled),
  );
  // The consumer's `id`, else the generated one, which the Panel, created
  // after the tab, names. Kept out of the merge, where a wrapper's
  // `id={undefined}` would remove it ("`undefined` is a value", PLAN.md
  // section 8). `false`, the consumer's way to remove an attribute,
  // removes the Panel's `aria-labelledby` too.
  const id = () => props.id ?? root.generatedTabId(props.value);
  root.tabIds[value] = id;

  const ownProps: ButtonElementProps = {
    type: "button",
    role: "tab",
    get id() {
      return id();
    },
    // Solid 2.0 removes an attribute set to false, so spell the value out.
    get "aria-selected"() {
      return selected() ? "true" : "false";
    },
    get "aria-controls"() {
      return root.panelId(props.value);
    },
    get "aria-disabled"() {
      return props.disabled ? "true" : undefined;
    },
    get tabindex() {
      return root.isTabStop(element, selected()) ? 0 : -1;
    },
    get "data-selected"() {
      return selected() ? "" : undefined;
    },
    get "data-unselected"() {
      return selected() ? undefined : "";
    },
    get "data-disabled"() {
      return props.disabled ? "" : undefined;
    },
    onClick: select,
    onFocus: () => {
      root.setFocused(element);
      if (root.automatic()) select();
    },
    onBlur: () => root.setFocused(undefined),
    onKeyDown: (event) => root.navigate(event, element!),
    ref: (el) => {
      element = el;
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(el, "Tabs.Tab");
    },
  };
  // Mounted, so its place in the document is known.
  onSettled(() =>
    root.register({ element: element!, value: () => props.value }),
  );
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "value", "disabled", "id"),
  );
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
