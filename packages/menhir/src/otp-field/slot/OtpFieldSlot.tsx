import type { JSX } from "@solidjs/web";
import { merge, omit, onSettled, untrack } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useOtpFieldRootContext } from "../root/OtpFieldRootContext.ts";

export interface OtpFieldSlotProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The box's place in the code, from 0. Read once. */
  index: number;
  /** Renders the box as another element or component. Read once. */
  render?: RenderProp;
}

/**
 * A box: a `<div aria-hidden="true">` with the code's character at `index`,
 * then its children. `data-filled` while it has a character, `data-active`
 * while the Input has focus and the box is in its selection or holds its
 * caret, and `data-caret` while the caret is before its character, where
 * the consumer draws one. Place one per character inside `OtpField.Root`.
 */
export function OtpFieldSlot(props: OtpFieldSlotProps) {
  const root = useOtpFieldRootContext();
  const index = untrack(() => props.index);
  let element: HTMLElement | undefined;
  // A caret is a selection of none: before the box's character, or in the
  // first empty box.
  const caret = () => {
    const selection = root.selection();
    return selection?.[0] === selection?.[1] ? selection?.[0] : undefined;
  };
  const ownProps = merge(root.attributes, {
    "aria-hidden": "true",
    get children() {
      return [root.value()[index], props.children];
    },
    get "data-filled"() {
      return index < root.value().length ? "" : undefined;
    },
    get "data-active"() {
      const selection = root.selection();
      if (!selection) return undefined;
      const position = caret();
      // After the last character of a full code, the last box.
      return (
        position === undefined
          ? index >= selection[0] && index < selection[1]
          : index === Math.min(position, root.props.length - 1)
      )
        ? ""
        : undefined;
    },
    get "data-caret"() {
      return caret() === index ? "" : undefined;
    },
    ref: (el: HTMLElement) => {
      element = el;
      root.slots[index] = el;
    },
  }) as ElementProps;
  onSettled(() => () => {
    if (root.slots[index] === element) delete root.slots[index];
  });
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "index", "children"),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
