import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { createToolbarItem } from "../item/createToolbarItem.ts";

export interface ToolbarLinkProps extends Omit<
  JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
  "ref"
> {
  ref?: JSX.Ref<HTMLElement>;
  /**
   * Whether the link ignores the user: a click does not navigate. It stays
   * focusable, with `aria-disabled`, so that a screen reader user finds it.
   */
  disabled?: boolean;
  /** Renders the link with your own component. Read once. */
  render?: RenderProp;
}

/** A link of the toolbar: an `<a>`. Place it inside `Toolbar.Root`. */
export function ToolbarLink(props: ToolbarLinkProps) {
  const item = createToolbarItem(props);
  const rest = omit(props, "render", "disabled");
  const elementProps = mergeElementProps(
    item.own,
    rest as JSX.HTMLAttributes<HTMLElement>,
  );
  return renderElement(props, elementProps, (p) => <a {...p} />);
}
