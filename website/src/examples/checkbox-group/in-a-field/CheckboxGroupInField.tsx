import { CheckboxGroup } from "menhir/checkbox-group";
import { Field } from "menhir/field";
import { For } from "solid-js";

const topics = ["Releases", "Security notices", "Events"];

export default function CheckboxGroupInField() {
  return (
    <Field.Root name="topics">
      <Field.Control render={CheckboxGroup.Root} required>
        <legend>Email me about</legend>
        <Field.Description>Choose at least one.</Field.Description>
        <For each={topics}>
          {(topic) => (
            <label>
              <CheckboxGroup.Item value={topic}>
                <CheckboxGroup.Indicator />
              </CheckboxGroup.Item>
              {topic}
            </label>
          )}
        </For>
        <Field.Error match="valueMissing">Choose a topic to go on.</Field.Error>
      </Field.Control>
    </Field.Root>
  );
}
