import type { JSX } from "@solidjs/web";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { createIdSlot } from "../../core/slot.ts";
import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";
import { DialogRootContext } from "./DialogRootContext.ts";
import type {
  DialogRootContextValue,
  DialogStateAttributes,
} from "./DialogRootContext.ts";

export interface DialogRootProps {
  /** Whether the dialog is open, when controlled. */
  open?: boolean;
  /** Whether the dialog is open at first, when uncontrolled. */
  defaultOpen?: boolean;
  /**
   * Called with the new value, and why, when the user opens or closes the
   * dialog. When controlled, the dialog changes only if `open` does.
   */
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  children?: JSX.Element;
}

/**
 * A modal dialog: holds whether it is open and shares it with
 * `Dialog.Trigger`, `Dialog.Popup` and the parts inside it. Renders no
 * element of its own.
 */
export function DialogRoot(props: DialogRootProps) {
  const [open, setOpen] = createControllableSignal<boolean, OpenChangeDetails>({
    get value() {
      return props.open;
    },
    get defaultValue() {
      return props.defaultOpen ?? false;
    },
    onChange: (value, details) => props.onOpenChange?.(value, details),
  });
  const attributes: DialogStateAttributes = {
    get "data-open"() {
      return open() ? "" : undefined;
    },
    get "data-closed"() {
      return open() ? undefined : "";
    },
  };
  const [titleId, registerTitleId] = createIdSlot();
  const [descriptionId, registerDescriptionId] = createIdSlot();
  const context: DialogRootContextValue = {
    open,
    setOpen,
    titleId,
    registerTitleId,
    descriptionId,
    registerDescriptionId,
    attributes,
  };
  return (
    <DialogRootContext value={context}>{props.children}</DialogRootContext>
  );
}
