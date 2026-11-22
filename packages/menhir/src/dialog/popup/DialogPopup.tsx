import { createOutsidePress } from "../../floating/dismissal/outsidePress.ts";
import { renderDialogPopup } from "./renderDialogPopup.tsx";
import type { DialogPopupProps } from "./renderDialogPopup.tsx";

export type { DialogPopupProps } from "./renderDialogPopup.tsx";

/**
 * The dialog itself: a `<dialog>`, opened with `showModal()`, so it is
 * modal, in the top layer, over an inert page. Named by `Dialog.Title` and
 * described by `Dialog.Description` when they are rendered inside it. A
 * press on the backdrop closes it. Place it inside `Dialog.Root`.
 */
export function DialogPopup(props: DialogPopupProps) {
  return renderDialogPopup(props, createOutsidePress);
}
