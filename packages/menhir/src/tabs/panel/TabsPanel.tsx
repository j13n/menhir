import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useTabsRootContext } from "../root/TabsRootContext.ts";

// No `id`: the Root generates the Panel's, which its tab names in
// `aria-controls` (README, "Shape").
export interface TabsPanelProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "id"
> {
  /** The `value` of the tab that shows this Panel. */
  value: string;
  render?: RenderProp;
}

/**
 * The content its tab shows: a `<div role="tabpanel">` named by the tab,
 * `hidden` unless the tab is selected. Place it inside `Tabs.Root`.
 */
export function TabsPanel(props: TabsPanelProps) {
  const root = useTabsRootContext();
  const selected = () => root.selected(props.value);
  const ownProps: ElementProps = {
    role: "tabpanel",
    get id() {
      return root.panelId(props.value);
    },
    get "aria-labelledby"() {
      return root.tabId(props.value);
    },
    // The pattern's note 4: a tab stop, for a panel whose first content is
    // not focusable.
    tabindex: 0,
    get hidden() {
      return !selected();
    },
    get "data-selected"() {
      return selected() ? "" : undefined;
    },
    get "data-unselected"() {
      return selected() ? undefined : "";
    },
  };
  const elementProps = mergeElementProps(
    ownProps,
    // An `id` from untyped code would break the tab's `aria-controls`, so
    // it is dropped too.
    omit(props as TabsPanelProps & { id?: string }, "render", "value", "id"),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
