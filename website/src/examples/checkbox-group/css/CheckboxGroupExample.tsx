import { CheckboxGroup } from "menhir/checkbox-group";
import { For } from "solid-js";

import "./checkbox-group.css";

const toppings = ["Mushrooms", "Olives", "Peppers"];

export default function CheckboxGroupExample() {
  return (
    <CheckboxGroup.Root
      name="toppings"
      defaultValue={["Olives"]}
      class="checkbox-group"
    >
      <legend>Toppings</legend>
      <label>
        <CheckboxGroup.Parent values={toppings} class="checkbox">
          <CheckboxGroup.Indicator class="indicator" />
        </CheckboxGroup.Parent>
        All toppings
      </label>
      <For each={toppings}>
        {(topping) => (
          <label class="child">
            <CheckboxGroup.Item value={topping} class="checkbox">
              <CheckboxGroup.Indicator class="indicator" />
            </CheckboxGroup.Item>
            {topping}
          </label>
        )}
      </For>
    </CheckboxGroup.Root>
  );
}
