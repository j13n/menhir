import { Toggle } from "menhir/toggle";

import "./toggle.css";

export default function ToggleExample() {
  return (
    <Toggle.Root aria-label="Bold" class="toggle">
      B
    </Toggle.Root>
  );
}
