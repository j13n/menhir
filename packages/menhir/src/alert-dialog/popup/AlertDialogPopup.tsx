import { renderDialogPopup } from "../../dialog/popup/renderDialogPopup.tsx";
import type { DialogPopupProps } from "../../dialog/popup/renderDialogPopup.tsx";

export type AlertDialogPopupProps = DialogPopupProps;

/**
 * The alert dialog itself: a `<dialog role="alertdialog">`, opened with
 * `showModal()`, so it is modal, in the top layer, over an inert page.
 * Named by `AlertDialog.Title` and described by `AlertDialog.Description`,
 * the message, when they are rendered inside it. Escape closes it; a press
 * on the backdrop does not. Place it inside `AlertDialog.Root`.
 */
export function AlertDialogPopup(props: AlertDialogPopupProps) {
  return renderDialogPopup(props, undefined, "alertdialog");
}
