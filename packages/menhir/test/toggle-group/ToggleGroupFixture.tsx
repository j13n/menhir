// Rendered on the server and hydrated in the test, so both sides get the
// same tree. The first item is disabled, so the tab stop is the second.
import { For } from "solid-js";

import { ToggleGroup } from "../../src/toggle-group/index.ts";

export default function ToggleGroupFixture() {
  return (
    <ToggleGroup.Root aria-label="Format" multiple defaultValue={["italic"]}>
      <For each={["Bold", "Italic", "Underline"]}>
        {(name) => (
          <ToggleGroup.Item
            value={name.toLowerCase()}
            disabled={name === "Bold"}
          >
            {name}
          </ToggleGroup.Item>
        )}
      </For>
    </ToggleGroup.Root>
  );
}
