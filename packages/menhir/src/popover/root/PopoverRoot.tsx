import type { JSX } from "@solidjs/web";
import { createUniqueId } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { createIdSlot } from "../../core/slot.ts";
import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";
import { PopoverRootContext } from "./PopoverRootContext.ts";
import type {
  PopoverRootContextValue,
  PopoverStateAttributes,
} from "./PopoverRootContext.ts";

export interface PopoverRootProps {
  /** Whether the popover is open, when controlled. */
  open?: boolean;
  /** Whether the popover is open at first, when uncontrolled. */
  defaultOpen?: boolean;
  /**
   * Called with the new value, and why, when the user opens or closes the
   * popover. When controlled, the popover changes only if `open` does.
   */
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  children?: JSX.Element;
}

/**
 * A non-modal popup placed against its trigger: holds whether it is open
 * and shares it with `Popover.Trigger`, `Popover.Popup` and the parts
 * inside it. Renders no element of its own.
 */
export function PopoverRoot(props: PopoverRootProps) {
  const [open, setOpen] = createControllableSignal<boolean, OpenChangeDetails>({
    get value() {
      return props.open;
    },
    get defaultValue() {
      return props.defaultOpen ?? false;
    },
    onChange: (value, details) => props.onOpenChange?.(value, details),
  });
  const attributes: PopoverStateAttributes = {
    get "data-open"() {
      return open() ? "" : undefined;
    },
    get "data-closed"() {
      return open() ? undefined : "";
    },
  };
  const [titleId, registerTitleId] = createIdSlot();
  const [descriptionId, registerDescriptionId] = createIdSlot();
  const context: PopoverRootContextValue = {
    open,
    setOpen,
    popupId: createUniqueId(),
    trigger: undefined,
    titleId,
    registerTitleId,
    descriptionId,
    registerDescriptionId,
    attributes,
  };
  return (
    <PopoverRootContext value={context}>{props.children}</PopoverRootContext>
  );
}
