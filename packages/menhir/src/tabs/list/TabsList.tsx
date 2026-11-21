import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useTabsRootContext } from "../root/TabsRootContext.ts";

export interface TabsListProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The list of tabs: a `<div role="tablist">` around `Tabs.Tab`s, with one
 * tab stop among them. Name it with `aria-label` or `aria-labelledby`.
 * Place it inside `Tabs.Root`.
 */
export function TabsList(props: TabsListProps) {
  const root = useTabsRootContext();
  const ownProps: ElementProps = {
    role: "tablist",
    // Horizontal is the tablist role's default.
    get "aria-orientation"() {
      return root.vertical() ? "vertical" : undefined;
    },
    get "data-horizontal"() {
      return root.vertical() ? undefined : "";
    },
    get "data-vertical"() {
      return root.vertical() ? "" : undefined;
    },
  };
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
