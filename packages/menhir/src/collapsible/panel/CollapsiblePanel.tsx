import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useCollapsibleRootContext } from "../root/CollapsibleRootContext.ts";

// No `id`: the Root generates the Panel's, which the Trigger names in
// `aria-controls` (README, "Shape").
export interface CollapsiblePanelProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "id"
> {
  render?: RenderProp;
}

/**
 * The content the Trigger shows and hides: a `<div>`, `hidden` while
 * closed. Place it inside `Collapsible.Root`.
 */
export function CollapsiblePanel(props: CollapsiblePanelProps) {
  const root = useCollapsibleRootContext();
  const ownProps = merge(root.attributes, {
    id: root.panelId,
    get hidden() {
      return !root.open();
    },
  });
  const elementProps = mergeElementProps(
    ownProps,
    // An `id` from untyped code would break the Trigger's `aria-controls`,
    // so it is dropped too.
    omit(props as CollapsiblePanelProps & { id?: string }, "render", "id"),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
