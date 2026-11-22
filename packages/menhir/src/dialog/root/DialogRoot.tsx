import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
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
 * The `id` a part hands over once mounted, for another part to name: the
 * current one, and what hands one over and returns what takes it back. A
 * part takes back only its own, so a later one that replaced it stays.
 */
function createIdSlot(): [
  id: () => string | undefined,
  set: (id: () => string | false) => () => void,
] {
  const [slot, setSlot] = createSignal<(() => string | false) | undefined>();
  // `false`, the consumer's way to remove the part's `id`, names nothing.
  const id = () => slot()?.() || undefined;
  const set = (next: () => string | false) => {
    setSlot(() => next);
    return () => setSlot((current) => (current === next ? undefined : current));
  };
  return [id, set];
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
  const [titleId, setTitleId] = createIdSlot();
  const [descriptionId, setDescriptionId] = createIdSlot();
  const context: DialogRootContextValue = {
    open,
    setOpen,
    titleId,
    setTitleId,
    descriptionId,
    setDescriptionId,
    attributes,
  };
  return (
    <DialogRootContext value={context}>{props.children}</DialogRootContext>
  );
}
