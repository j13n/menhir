import { Radio } from "menhir/radio";
import { For } from "solid-js";

import "./radio.css";

const sizes = ["Small", "Medium", "Large"];

export default function RadioExample() {
  return (
    <Radio.Root name="size" defaultValue="Medium" class="radio-group">
      <legend>Size</legend>
      <For each={sizes}>
        {(size) => (
          <label>
            <Radio.Item value={size} class="radio">
              <Radio.Indicator class="indicator" />
            </Radio.Item>
            {size}
          </label>
        )}
      </For>
    </Radio.Root>
  );
}
