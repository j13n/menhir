import { SegmentedControl } from "@kobalte/core/segmented-control";
import { For } from "solid-js";

import { fruits } from "../../../../shared/content.ts";

export default function SegmentedControlDemo() {
  return (
    <SegmentedControl class="stack" defaultValue={fruits[0]}>
      <SegmentedControl.Label>Favourite fruit</SegmentedControl.Label>
      <div class="segments" role="presentation">
        <SegmentedControl.Indicator class="segment-indicator" />
        <For each={fruits}>
          {(fruit) => (
            <SegmentedControl.Item class="segment" value={fruit}>
              <SegmentedControl.ItemInput />
              <SegmentedControl.ItemLabel>{fruit}</SegmentedControl.ItemLabel>
            </SegmentedControl.Item>
          )}
        </For>
      </div>
    </SegmentedControl>
  );
}
