import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { createListValue } from "../../core/listValue.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { AccordionRootContext } from "./AccordionRootContext.ts";
import type { AccordionRootContextValue } from "./AccordionRootContext.ts";

export interface AccordionRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The values of the open Items, when controlled. */
  value?: string[];
  /** The values of the Items open at first, when uncontrolled. */
  defaultValue?: string[];
  /**
   * Called with the new values when the user opens or closes an Item. When
   * controlled, the accordion changes only if `value` does.
   */
  onValueChange?: (value: string[]) => void;
  /**
   * Whether several Items can be open at once. Otherwise opening an Item
   * closes the one open before.
   */
  multiple?: boolean;
  /** Whether every Trigger ignores the user. They cannot be focused either. */
  disabled?: boolean;
  render?: RenderProp;
}

/**
 * A stack of sections, each shown and hidden by its heading's button: a
 * `<div>` around `Accordion.Item`s.
 */
export function AccordionRoot(props: AccordionRootProps) {
  const open = createListValue({
    get value() {
      return props.value;
    },
    get defaultValue() {
      return props.defaultValue;
    },
    get multiple() {
      return props.multiple;
    },
    onChange: (value) => props.onValueChange?.(value),
  });
  const context: AccordionRootContextValue = {
    open: open.has,
    setOpen: open.set,
    disabled: () => props.disabled,
  };

  const ownProps: ElementProps = {
    get "data-disabled"() {
      return props.disabled ? "" : undefined;
    },
  };
  const elementProps = mergeElementProps(
    ownProps,
    omit(
      props,
      "render",
      "value",
      "defaultValue",
      "onValueChange",
      "multiple",
      "disabled",
    ),
  );
  return (
    <AccordionRootContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </AccordionRootContext>
  );
}
