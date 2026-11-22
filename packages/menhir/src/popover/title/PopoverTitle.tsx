import type { JSX } from "@solidjs/web";
import { createUniqueId, merge, omit, onSettled } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { usePopoverRootContext } from "../root/PopoverRootContext.ts";

export interface PopoverTitleProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The popover's title, which names the Popup in `aria-labelledby`: an
 * `<h2>`. Place it inside `Popover.Popup`.
 */
export function PopoverTitle(props: PopoverTitleProps) {
  const root = usePopoverRootContext();
  const generated = createUniqueId();
  // The consumer's `id`, else the generated one. Kept out of the merge,
  // where a wrapper's `id={undefined}` would remove it ("`undefined` is a
  // value", PLAN.md section 8).
  const id = () => props.id ?? generated;
  // Named once mounted, so the Popup names only a Title that is rendered,
  // and none in the server HTML (README, "Decisions").
  onSettled(() => root.registerTitleId(id));
  const ownProps = merge(root.attributes, {
    get id() {
      return id();
    },
  });
  const elementProps = mergeElementProps(ownProps, omit(props, "render", "id"));
  return renderElement(props, elementProps, (p) => <h2 {...p} />);
}
