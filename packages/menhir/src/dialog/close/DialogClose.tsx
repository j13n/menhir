import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { warnUnlessButton } from "../../core/button.ts";
import type { ButtonElementProps } from "../../core/button.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useDialogRootContext } from "../root/DialogRootContext.ts";

export interface DialogCloseProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * A button that closes the dialog: a `<button type="button">`, such as
 * "Cancel" or a close icon with an `aria-label`. Place it inside
 * `Dialog.Popup`.
 */
export function DialogClose(props: DialogCloseProps) {
  const root = useDialogRootContext();
  const ownProps = merge(root.attributes, {
    type: "button",
    onClick: (event: MouseEvent) =>
      root.setOpen(false, { reason: "close-press", event }),
    ref: (element: HTMLElement) => {
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, "Dialog.Close");
    },
  } satisfies ButtonElementProps);
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
