import { createMemo, merge, omit } from "solid-js";

import { CheckboxRoot } from "../../checkbox/root/CheckboxRoot.tsx";
import type { CheckboxRootProps } from "../../checkbox/root/CheckboxRoot.tsx";
import { useCheckboxGroupRootContext } from "../root/CheckboxGroupRootContext.ts";

export interface CheckboxGroupItemProps extends Omit<
  CheckboxRootProps,
  | "checked"
  | "defaultChecked"
  | "onCheckedChange"
  | "indeterminate"
  | "name"
  | "value"
  | "required"
  | "form"
> {
  /** Identifies the box in the group's value, and is submitted while it is checked. */
  value: string;
}

/**
 * One box of the group: a `Checkbox.Root`, checked while the group's value
 * has its `value`. Place it inside `CheckboxGroup.Root`.
 */
export function CheckboxGroupItem(props: CheckboxGroupItemProps) {
  const group = useCheckboxGroupRootContext();
  // A memo, so that a change to the list that leaves this box as it was
  // does not run the box's bindings again: a hidden input the user changed
  // in the same turn, not yet in the list, would be written back over.
  const checked = createMemo(() => group.value().includes(props.value));
  const own: CheckboxRootProps = {
    get checked() {
      return checked();
    },
    // The group puts the list back on a form reset, once. Checkbox's own
    // reset asks for `defaultChecked`, so passing the box's state makes it
    // ask for nothing, and put its hidden input back to that state.
    get defaultChecked() {
      return checked();
    },
    onCheckedChange: (included) => {
      // Reads lag writes, so a second change before the flush builds on
      // the first, not on what `value` still reads.
      const next = group.requested().filter((item) => item !== props.value);
      if (included) next.push(props.value);
      group.setValue(next);
    },
    get name() {
      return group.name();
    },
    get value() {
      return props.value;
    },
    get form() {
      return group.form();
    },
    get disabled() {
      return group.disabled() || props.disabled;
    },
  };
  const checkboxProps = merge(omit(props, "value", "disabled"), own);
  return <CheckboxRoot {...checkboxProps} />;
}
