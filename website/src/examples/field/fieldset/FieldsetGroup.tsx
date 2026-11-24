import { createMemo, createSignal, For } from "solid-js";
import { Checkbox } from "menhir/checkbox";
import { Field } from "menhir/field";

const topics = ["Releases", "Security notices", "Events"];

export default function FieldsetGroup() {
  const [chosen, setChosen] = createSignal<string[]>(["Releases"]);
  const toggle = (topic: string, on: boolean) =>
    setChosen((list) =>
      on ? [...list, topic] : list.filter((t) => t !== topic),
    );
  // A rule the browser has no constraint for is an error from outside.
  const error = createMemo(() =>
    chosen().length === 0 ? "Choose at least one topic." : undefined,
  );
  return (
    <Field.Root name="topics" error={error()}>
      <Field.Control render={(props) => <fieldset {...props} />}>
        <legend>Email me about</legend>
        <Field.Description>You can change this later.</Field.Description>
        <For each={topics}>
          {(topic) => (
            <label>
              <Checkbox.Root
                name="topics"
                value={topic}
                checked={chosen().includes(topic)}
                onCheckedChange={(on) => toggle(topic, on)}
              >
                <Checkbox.Indicator />
              </Checkbox.Root>
              {topic}
            </label>
          )}
        </For>
        <Field.Error />
      </Field.Control>
    </Field.Root>
  );
}
