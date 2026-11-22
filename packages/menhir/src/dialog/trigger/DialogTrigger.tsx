import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { warnUnlessButton } from "../../core/button.ts";
import type { ButtonElementProps } from "../../core/button.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useDialogRootContext } from "../root/DialogRootContext.ts";

export interface DialogTriggerProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The button that opens the dialog: a `<button type="button"
 * aria-haspopup="dialog">`. Place it inside `Dialog.Root`.
 */
export function DialogTrigger(props: DialogTriggerProps) {
  const root = useDialogRootContext();
  // No `aria-expanded`: the Trigger is inert while the dialog is open. No
  // `aria-controls`: the closed dialog is not shown (README, "Decisions").
  const ownProps = merge(root.attributes, {
    type: "button",
    "aria-haspopup": "dialog",
    onClick: (event: MouseEvent) =>
      root.setOpen(true, { reason: "trigger-press", event }),
    ref: (element: HTMLElement) => {
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, "Dialog.Trigger");
    },
  } satisfies ButtonElementProps);
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
