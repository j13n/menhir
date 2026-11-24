// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { For } from "solid-js";

import { CheckboxGroup } from "../../src/checkbox-group/index.ts";

const letters = ["a", "b", "c"];

export default function CheckboxGroupFixture() {
  return (
    <form data-testid="form">
      <CheckboxGroup.Root name="letters" defaultValue={["b"]} required>
        <legend>Letters</legend>
        <label>
          <CheckboxGroup.Parent values={letters}>
            <CheckboxGroup.Indicator data-testid="parent-indicator" />
          </CheckboxGroup.Parent>
          All
        </label>
        <For each={letters}>
          {(letter) => (
            <label>
              <CheckboxGroup.Item value={letter}>
                <CheckboxGroup.Indicator />
              </CheckboxGroup.Item>
              {letter}
            </label>
          )}
        </For>
      </CheckboxGroup.Root>
    </form>
  );
}
