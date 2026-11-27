import { Switch } from "@kobalte/core/switch";

export default function SwitchDemo() {
  return (
    <div class="stack">
      <Switch class="row">
        <Switch.Input />
        <Switch.Control class="switch">
          <Switch.Thumb class="switch-thumb" />
        </Switch.Control>
        <Switch.Label>Airplane mode</Switch.Label>
      </Switch>
      <Switch class="row" disabled>
        <Switch.Input />
        <Switch.Control class="switch">
          <Switch.Thumb class="switch-thumb" />
        </Switch.Control>
        <Switch.Label>Bluetooth</Switch.Label>
      </Switch>
    </div>
  );
}
