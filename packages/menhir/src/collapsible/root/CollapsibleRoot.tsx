import type { JSX } from "@solidjs/web";
import { createUniqueId, omit } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { CollapsibleRootContext } from "./CollapsibleRootContext.ts";
import type {
  CollapsibleRootContextValue,
  CollapsibleStateAttributes,
} from "./CollapsibleRootContext.ts";

export interface CollapsibleRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Whether the Panel is shown, when controlled. */
  open?: boolean;
  /** Whether the Panel is shown at first, when uncontrolled. */
  defaultOpen?: boolean;
  /**
   * Called with the new value when the user shows or hides the Panel. When
   * controlled, the Panel changes only if `open` does.
   */
  onOpenChange?: (open: boolean) => void;
  /** Whether the Trigger ignores the user. It cannot be focused either. */
  disabled?: boolean;
  render?: RenderProp;
}

/**
 * A section of content that a button shows and hides: a `<div>` around
 * `Collapsible.Trigger` and `Collapsible.Panel`.
 */
export function CollapsibleRoot(props: CollapsibleRootProps) {
  const [open, setOpen] = createControllableSignal({
    get value() {
      return props.open;
    },
    get defaultValue() {
      return props.defaultOpen ?? false;
    },
    onChange: (value) => props.onOpenChange?.(value),
  });

  const attributes: CollapsibleStateAttributes = {
    get "data-open"() {
      return open() ? "" : undefined;
    },
    get "data-closed"() {
      return open() ? undefined : "";
    },
    get "data-disabled"() {
      return props.disabled ? "" : undefined;
    },
  };
  const context: CollapsibleRootContextValue = {
    open,
    setOpen,
    disabled: () => props.disabled,
    panelId: createUniqueId(),
    attributes,
  };

  const elementProps = mergeElementProps(
    attributes,
    omit(props, "render", "open", "defaultOpen", "onOpenChange", "disabled"),
  );
  return (
    <CollapsibleRootContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </CollapsibleRootContext>
  );
}
