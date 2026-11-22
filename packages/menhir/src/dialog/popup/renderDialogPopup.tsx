import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps } from "../../core/renderElement.tsx";
import { createDialogClose } from "../../floating/dismissal/dialogClose.ts";
import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";
import { createInitialFocus } from "../../floating/focus/initialFocus.ts";
import { createReturnFocus } from "../../floating/focus/returnFocus.ts";
import { createTabWrap } from "../../floating/focus/tabWrap.ts";
import type { FocusTarget } from "../../floating/focus/target.ts";
import { createPresence } from "../../floating/presence/presence.ts";
import { createScrollLock } from "../../floating/scroll-lock/scrollLock.ts";
import { useDialogRootContext } from "../root/DialogRootContext.ts";

// No `tabindex`, as Solid's own `<dialog>` type has none: a dialog is not
// interactive itself, and `showModal()` focuses it when nothing inside can
// take focus. So the props a render function gets spread onto a `<dialog>`.
type DialogElementProps = Omit<ElementProps, "tabindex">;

export interface DialogPopupProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "tabindex"
> {
  /**
   * Where focus goes once the dialog has opened, instead of the browser's
   * choice: the element with `autofocus`, else the first focusable one. An
   * element, or a function called on each opening with the browser's
   * choice, such as `() => input` for an element reached through a ref.
   */
  initialFocus?: FocusTarget;
  /**
   * Where focus goes once the dialog has closed, instead of the browser's
   * choice: the element focused before it opened. An element, or a function
   * called with the browser's choice, or `null` when it found none, such as
   * `(focused) => focused ?? fallback`.
   */
  returnFocus?: FocusTarget;
  /** Must render a `<dialog>`, which the Popup opens with `showModal()`. */
  render?: (props: DialogElementProps) => JSX.Element;
}

/** What the Popup hands to `outsidePress`, as getters. */
export interface DialogPopupOptions {
  readonly dialog: HTMLDialogElement | undefined;
  readonly open: boolean;
  onDismiss(details: OpenChangeDetails): void;
}

/**
 * What a modal dialog's Popup does, for `Dialog.Popup` and
 * `AlertDialog.Popup` (#32): a `<dialog>` opened with `showModal()`, closed
 * by a close request, with Tab wrapping inside, the focus props, the page's
 * scroll locked, and named by its Title and Description. `outsidePress`
 * adds Dialog's press on the backdrop, so that Alert Dialog does not bundle
 * it; `role` is Alert Dialog's `alertdialog`. Two arguments, not an
 * options object, which measured 14 B more in `menhir/dialog`.
 */
export function renderDialogPopup(
  props: DialogPopupProps,
  outsidePress?: (options: DialogPopupOptions) => void,
  role?: "alertdialog",
): JSX.Element {
  const root = useDialogRootContext();
  let dialog: HTMLDialogElement | undefined;
  // What every module of the `floating` layer takes, as getters.
  const options = {
    get dialog() {
      return dialog;
    },
    get popup() {
      return dialog;
    },
    get open() {
      return root.open();
    },
    onDismiss: (details: OpenChangeDetails) => root.setOpen(false, details),
    get initialFocus() {
      return props.initialFocus;
    },
    get returnFocus() {
      return props.returnFocus;
    },
  };
  createPresence(options);
  createDialogClose(options);
  outsidePress?.(options);
  createScrollLock(options);
  createTabWrap(options);
  createInitialFocus(options);
  createReturnFocus(options);

  const ownProps = merge(root.attributes, {
    role,
    // The consumer's, else the Title's and Description's ids. Kept out of
    // the merge, where a wrapper's `aria-labelledby={undefined}` would
    // remove the Title's ("`undefined` is a value", PLAN.md section 8);
    // `false` removes it.
    get "aria-labelledby"() {
      return props["aria-labelledby"] ?? root.titleId();
    },
    get "aria-describedby"() {
      return props["aria-describedby"] ?? root.descriptionId();
    },
    ref: (element: HTMLElement) => {
      // Production builds drop the check, and the part's name, with `isDev`.
      if (isDev && !(element instanceof HTMLDialogElement)) {
        console.warn(
          `[menhir] ${role ? "AlertDialog" : "Dialog"}.Popup's render function rendered a <${element.tagName.toLowerCase()}>. ` +
            "Render a <dialog>, which the Popup opens with showModal().",
        );
      }
      dialog = element as HTMLDialogElement;
    },
  } satisfies ElementProps);
  const elementProps = mergeElementProps(
    ownProps,
    omit(
      props,
      "render",
      "initialFocus",
      "returnFocus",
      "aria-labelledby",
      "aria-describedby",
    ),
  );
  return renderElement(props, elementProps, (p: DialogElementProps) => (
    <dialog {...p} />
  ));
}
