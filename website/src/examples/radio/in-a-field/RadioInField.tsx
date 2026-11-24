import { Field } from "menhir/field";
import { Radio } from "menhir/radio";
import { For } from "solid-js";

const plans = ["Monthly", "Yearly"];

export default function RadioInField() {
  return (
    <Field.Root name="plan">
      <Field.Control render={Radio.Root} required>
        <legend>Plan</legend>
        <Field.Description>You can change it at any time.</Field.Description>
        <For each={plans}>
          {(plan) => (
            <label>
              <Radio.Item value={plan}>
                <Radio.Indicator />
              </Radio.Item>
              {plan}
            </label>
          )}
        </For>
        <Field.Error match="valueMissing">Choose a plan to go on.</Field.Error>
      </Field.Control>
    </Field.Root>
  );
}
