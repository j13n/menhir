import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { merge, omit, onSettled } from "solid-js";

import { warnUnlessButton } from "../../core/button.ts";
import type { ButtonElementProps } from "../../core/button.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useToastRootContext } from "../root/ToastRootContext.ts";

export interface ToastActionProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * Something to do about the toast's message, such as "Undo": a
 * `<button type="button">` that runs its `onClick`, then closes the toast.
 * A toast with an Action does not leave by itself, unless it was given a
 * `duration` of its own, so the button is not lost to someone who needs
 * longer to reach it. Place it inside `Toast.Root`.
 */
export function ToastAction(props: ToastActionProps) {
  const root = useToastRootContext();
  onSettled(() => root.registerAction());
  const ownProps = merge(root.attributes, {
    type: "button",
    onClick: (event: MouseEvent) => root.close("action-press", event),
    ref: (element: HTMLElement) => {
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, "Toast.Action");
    },
  } satisfies ButtonElementProps);
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
