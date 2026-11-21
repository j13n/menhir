import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { twoStateButtonProps } from "../../core/button.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useCollapsibleRootContext } from "../root/CollapsibleRootContext.ts";

export interface CollapsibleTriggerProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The button that shows and hides the Panel: a `<button aria-expanded>`.
 * Place it inside `Collapsible.Root`.
 */
export function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  const root = useCollapsibleRootContext();
  const ownProps = merge(
    root.attributes,
    twoStateButtonProps(
      {
        get value() {
          return root.open();
        },
        get disabled() {
          return root.disabled();
        },
        setValue: root.setOpen,
      },
      "aria-expanded",
      "Collapsible.Trigger",
    ),
    { "aria-controls": root.panelId },
  );
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
