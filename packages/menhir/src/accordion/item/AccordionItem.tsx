import type { JSX } from "@solidjs/web";
import { createUniqueId, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useAccordionRootContext } from "../root/AccordionRootContext.ts";
import { AccordionItemContext } from "./AccordionItemContext.ts";
import type {
  AccordionItemContextValue,
  AccordionItemStateAttributes,
} from "./AccordionItemContext.ts";

export interface AccordionItemProps extends JSX.HTMLAttributes<HTMLElement> {
  /**
   * Identifies the Item in the Root's value. Without one, the Item uses a
   * generated value, which no other code knows.
   */
  value?: string;
  /** Whether the Trigger ignores the user. It cannot be focused either. */
  disabled?: boolean;
  render?: RenderProp;
}

/**
 * One section of the accordion: a `<div>` around `Accordion.Header` and
 * `Accordion.Panel`. Place it inside `Accordion.Root`.
 */
export function AccordionItem(props: AccordionItemProps) {
  const root = useAccordionRootContext();
  const panelId = createUniqueId();
  const generatedTriggerId = createUniqueId();
  // Without a value, the Panel's id serves as one: unique, and one
  // `createUniqueId` fewer than a value of its own.
  const value = () => props.value ?? panelId;
  const open = () => root.open(value());
  const disabled = () => !!(root.disabled() || props.disabled);

  const attributes: AccordionItemStateAttributes = {
    get "data-open"() {
      return open() ? "" : undefined;
    },
    get "data-closed"() {
      return open() ? undefined : "";
    },
    get "data-disabled"() {
      return disabled() ? "" : undefined;
    },
  };
  const context: AccordionItemContextValue = {
    open,
    setOpen: (next) => root.setOpen(value(), next),
    disabled,
    panelId,
    triggerId: () => generatedTriggerId,
    attributes,
  };

  const elementProps = mergeElementProps(
    attributes,
    omit(props, "render", "value", "disabled"),
  );
  return (
    <AccordionItemContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </AccordionItemContext>
  );
}
