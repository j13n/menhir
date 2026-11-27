import { useId } from "react";

import { Checkbox } from "@base-ui/react/checkbox";
import { CheckboxGroup } from "@base-ui/react/checkbox-group";

export default function CheckboxGroupDemo() {
  // The group has no label part; the docs name it with `aria-labelledby`.
  const id = useId();

  return (
    <CheckboxGroup
      aria-labelledby={id}
      defaultValue={["cheese"]}
      className="stack"
    >
      <div id={id}>Toppings</div>

      <label className="row">
        <Checkbox.Root value="cheese" className="box">
          <Checkbox.Indicator className="check" />
        </Checkbox.Root>
        Cheese
      </label>

      <label className="row">
        <Checkbox.Root value="mushrooms" className="box">
          <Checkbox.Indicator className="check" />
        </Checkbox.Root>
        Mushrooms
      </label>

      <label className="row">
        <Checkbox.Root value="olives" className="box" disabled>
          <Checkbox.Indicator className="check" />
        </Checkbox.Root>
        Olives
      </label>
    </CheckboxGroup>
  );
}
