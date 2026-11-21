import { Checkbox } from "menhir/checkbox";
import { For, createSignal } from "solid-js";

import "./checkbox.css";

const topics = ["Product news", "Security alerts"];

export default function CheckboxExample() {
  const [checked, setChecked] = createSignal([false, true]);
  const all = () => checked().every(Boolean);
  const some = () => checked().some(Boolean);
  return (
    <div class="checkbox-example">
      <label>
        <Checkbox.Root
          checked={all()}
          indeterminate={some() && !all()}
          onCheckedChange={(value) => setChecked(topics.map(() => value))}
          class="checkbox"
        >
          <Checkbox.Indicator class="indicator" />
        </Checkbox.Root>
        Email updates
      </label>
      <For each={topics}>
        {(topic, index) => (
          <label class="child">
            <Checkbox.Root
              name="topics"
              value={topic}
              checked={checked()[index()]}
              onCheckedChange={(value) =>
                setChecked((current) =>
                  current.map((old, i) => (i === index() ? value : old)),
                )
              }
              class="checkbox"
            >
              <Checkbox.Indicator class="indicator" />
            </Checkbox.Root>
            {topic}
          </label>
        )}
      </For>
    </div>
  );
}
