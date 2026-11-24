import { createMemo, merge, omit } from "solid-js";

import { CheckboxRoot } from "../../checkbox/root/CheckboxRoot.tsx";
import type { CheckboxRootProps } from "../../checkbox/root/CheckboxRoot.tsx";
import { useCheckboxGroupRootContext } from "../root/CheckboxGroupRootContext.ts";

export interface CheckboxGroupParentProps extends Omit<
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
  /**
   * The values of the boxes the parent checks and unchecks, usually every
   * Item's. It is checked while the group's value has all of them, mixed
   * while it has some.
   */
  values: string[];
}

/**
 * A checkbox over the group's boxes: a `Checkbox.Root`, checked while every
 * box of `values` is, mixed while some are. A click on a mixed parent checks
 * all, on a checked one unchecks all, and on an unchecked one brings back
 * the boxes checked when it was last mixed, or checks all. It submits
 * nothing. Place it inside `CheckboxGroup.Root`.
 */
export function CheckboxGroupParent(props: CheckboxGroupParentProps) {
  const group = useCheckboxGroupRootContext();
  // The list the parent set last, by reference: a list it did not set is
  // a change the user made, through a box or a reset.
  let set: string[] | undefined;
  // The boxes of `values` that are checked, and the combination a click on
  // the unchecked parent brings back: the one the user made last, which a
  // change by the parent leaves as it was, as the WAI-ARIA mixed-state
  // example does. Read by the bindings below, so it sees every change.
  const boxes = createMemo<{ checked: string[]; remembered: string[] }>(
    (previous) => {
      const list = group.value();
      const checked = props.values.filter((item) => list.includes(item));
      return {
        checked,
        remembered: previous && list === set ? previous.remembered : checked,
      };
    },
  );
  // Memos, so that a change to the list that leaves the parent as it was
  // does not run its bindings again (CheckboxGroupItem).
  const allChecked = createMemo(
    () =>
      props.values.length > 0 && boxes().checked.length === props.values.length,
  );
  const someChecked = createMemo(() => boxes().checked.length > 0);
  const own: CheckboxRootProps = {
    get checked() {
      return allChecked();
    },
    // The group puts the list back on a form reset, so Checkbox's own reset
    // must ask for nothing (CheckboxGroupItem).
    get defaultChecked() {
      return allChecked();
    },
    get indeterminate() {
      return someChecked() && !allChecked();
    },
    // Checkbox asks for the opposite of `checked`: `false` from a checked
    // parent, `true` from a mixed or an unchecked one.
    onCheckedChange: (checked) => {
      const values = props.values;
      const current = group.requested();
      const others = current.filter((item) => !values.includes(item));
      const { remembered } = boxes();
      let next = others;
      if (checked) {
        // Mixed, or unchecked with nothing to bring back: check all.
        next =
          values.some((item) => current.includes(item)) ||
          remembered.length === 0
            ? [...current, ...values.filter((item) => !current.includes(item))]
            : [...others, ...remembered];
      }
      set = next;
      group.setValue(next);
    },
    get form() {
      return group.form();
    },
    get disabled() {
      return group.disabled() || props.disabled;
    },
  };
  const checkboxProps = merge(omit(props, "values", "disabled"), own);
  return <CheckboxRoot {...checkboxProps} />;
}
