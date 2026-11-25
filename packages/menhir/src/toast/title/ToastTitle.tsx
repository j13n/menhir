import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useToastRootContext } from "../root/ToastRootContext.ts";

export interface ToastTitleProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The toast's `title`, in a `<div>`: what `add()` was given, or its
 * children when it has any. Place it inside `Toast.Root`.
 */
export function ToastTitle(props: ToastTitleProps) {
  const root = useToastRootContext();
  const ownProps = merge(root.attributes, {
    get children() {
      return root.toast.title;
    },
  } satisfies ElementProps);
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
