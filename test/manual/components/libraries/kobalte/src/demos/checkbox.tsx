import { Checkbox } from "@kobalte/core/checkbox";
import { createSignal } from "solid-js";

export default function CheckboxDemo() {
  // `indeterminate` has no uncontrolled form, so the page holds it until
  // the first change.
  const [indeterminate, setIndeterminate] = createSignal(true);

  return (
    <div class="stack">
      <Checkbox class="row">
        <Checkbox.Input />
        <Checkbox.Control class="box">
          <Checkbox.Indicator>✓</Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Accept terms</Checkbox.Label>
      </Checkbox>

      <Checkbox
        class="row"
        indeterminate={indeterminate()}
        onChange={() => setIndeterminate(false)}
      >
        <Checkbox.Input />
        <Checkbox.Control class="box">
          <Checkbox.Indicator>{indeterminate() ? "–" : "✓"}</Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Select all</Checkbox.Label>
      </Checkbox>

      <Checkbox class="row" disabled>
        <Checkbox.Input />
        <Checkbox.Control class="box">
          <Checkbox.Indicator>✓</Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Subscribe</Checkbox.Label>
      </Checkbox>
    </div>
  );
}
