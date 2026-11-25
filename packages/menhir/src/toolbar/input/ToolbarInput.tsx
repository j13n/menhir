import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { createToolbarItem } from "../item/createToolbarItem.ts";

export interface ToolbarInputProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "disabled" | "ref"
> {
  ref?: JSX.Ref<HTMLElement>;
  /**
   * Whether the input ignores the user: it is read-only, and stays
   * focusable, with `aria-disabled`, so that a screen reader user finds it.
   */
  disabled?: boolean;
  /**
   * Renders the input as another element or component, such as
   * `Input.Root`, which joins the toolbar. Read once.
   */
  render?: RenderProp;
}

// A text field keeps Home and End, and the arrow keys while its caret can
// move that way (README, "Decisions"). `selectionStart` is null on an
// input with no caret, such as a checkbox.
const keeps = (element: HTMLElement, step: number) => {
  const field = element as HTMLInputElement;
  const caret = field.selectionStart;
  return (
    caret != null &&
    (!step ||
      field.selectionEnd !== caret ||
      (step < 0 ? caret > 0 : caret < field.value.length))
  );
};

// The caret starts on the side focus came from, so the next arrow key
// moves it.
const enter = (element: HTMLElement, atEnd: boolean) => {
  const field = element as HTMLInputElement;
  if (field.selectionStart != null) {
    const at = atEnd ? field.value.length : 0;
    field.setSelectionRange(at, at);
  }
};

/**
 * A text field of the toolbar: an `<input>`. It keeps Home and End, and
 * the arrow keys while its caret can move that way. Place it inside
 * `Toolbar.Root`.
 */
export function ToolbarInput(props: ToolbarInputProps) {
  const item = createToolbarItem(props, { keeps, enter });
  const own = merge(item.own, {
    get readonly() {
      return item.disabled() || props.readonly;
    },
  });
  const rest = omit(props, "render", "disabled", "readonly");
  const elementProps = mergeElementProps(
    own,
    rest as JSX.HTMLAttributes<HTMLElement>,
  );
  return renderElement(props, elementProps, (p) => <input {...p} />);
}
