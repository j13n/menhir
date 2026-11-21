import { Switch } from "menhir/switch";

import "./switch.css";

export default function SwitchExample() {
  return (
    <label class="switch-example">
      <Switch.Root name="wifi" defaultChecked class="switch">
        <Switch.Thumb class="thumb" />
      </Switch.Root>
      Wi-Fi
    </label>
  );
}
