import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { warnUnlessButton } from "../../core/button.ts";
import type { ButtonElementProps } from "../../core/button.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useToastRootContext } from "../root/ToastRootContext.ts";

export interface ToastCloseProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * A button that closes the toast: a `<button type="button">`, such as a
 * close icon with an `aria-label`. Place it inside `Toast.Root`.
 */
export function ToastClose(props: ToastCloseProps) {
  const root = useToastRootContext();
  const ownProps = merge(root.attributes, {
    type: "button",
    onClick: (event: MouseEvent) => root.close("close-press", event),
    ref: (element: HTMLElement) => {
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, "Toast.Close");
    },
  } satisfies ButtonElementProps);
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
