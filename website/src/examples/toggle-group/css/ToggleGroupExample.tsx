import { ToggleGroup } from "menhir/toggle-group";

import "./toggle-group.css";

export default function ToggleGroupExample() {
  return (
    <ToggleGroup.Root
      aria-label="Text alignment"
      defaultValue={["left"]}
      class="toggle-group"
    >
      <ToggleGroup.Item value="left" class="toggle-group-item">
        Left
      </ToggleGroup.Item>
      <ToggleGroup.Item value="center" class="toggle-group-item">
        Center
      </ToggleGroup.Item>
      <ToggleGroup.Item value="right" class="toggle-group-item">
        Right
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
