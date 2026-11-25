import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { createToolbarItem } from "../item/createToolbarItem.ts";

export interface ToolbarButtonProps extends JSX.HTMLAttributes<HTMLElement> {
  /**
   * Whether the button ignores the user. It stays focusable, with
   * `aria-disabled`, so that a screen reader user finds it.
   */
  disabled?: boolean;
  /**
   * Renders the button as another element or component, such as
   * `Toggle.Root` or a Menu's Trigger, which joins the toolbar. Read once.
   */
  render?: RenderProp;
}

/**
 * A button of the toolbar: a `<button type="button">`, or a control of
 * another component through `render`. Place it inside `Toolbar.Root`.
 */
export function ToolbarButton(props: ToolbarButtonProps) {
  const item = createToolbarItem(props);
  const elementProps = mergeElementProps(
    merge(item.own, { type: "button" }),
    omit(props, "render", "disabled"),
  );
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
