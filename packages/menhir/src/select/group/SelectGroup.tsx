import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { createIdSlot } from "../../core/slot.ts";
import { SelectGroupContext } from "./SelectGroupContext.ts";

export interface SelectGroupProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * Items that belong together: a `<div role="group">` named by its
 * `Select.GroupLabel`. Place it inside `Select.Popup`.
 */
export function SelectGroup(props: SelectGroupProps) {
  const [labelId, registerLabelId] = createIdSlot();
  const elementProps = mergeElementProps(
    {
      role: "group",
      // The consumer's, else the GroupLabel's id, while one is rendered.
      // Kept out of the merge ("`undefined` is a value", PLAN.md section 8).
      get "aria-labelledby"() {
        return props["aria-labelledby"] ?? labelId();
      },
    },
    omit(props, "render", "aria-labelledby"),
  );
  return (
    <SelectGroupContext value={{ registerLabelId }}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </SelectGroupContext>
  );
}
