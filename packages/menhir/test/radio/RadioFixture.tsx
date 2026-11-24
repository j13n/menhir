// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { For } from "solid-js";

import { Radio } from "../../src/radio/index.ts";

const letters = ["a", "b", "c"];

export default function RadioFixture() {
  return (
    <form data-testid="form">
      <Radio.Root name="letter" defaultValue="b" required>
        <legend>Letters</legend>
        <For each={letters}>
          {(letter) => (
            <label>
              <Radio.Item value={letter}>
                <Radio.Indicator />
              </Radio.Item>
              {letter}
            </label>
          )}
        </For>
      </Radio.Root>
    </form>
  );
}
