import { Label, Switch } from "radix-ui";

export default function SwitchDemo() {
  return (
    <div className="stack">
      <div className="row">
        <Switch.Root className="switch" id="airplane">
          <Switch.Thumb className="switch-thumb" />
        </Switch.Root>
        <Label.Root htmlFor="airplane">Airplane mode</Label.Root>
      </div>
      <div className="row">
        <Switch.Root className="switch" id="bluetooth" disabled>
          <Switch.Thumb className="switch-thumb" />
        </Switch.Root>
        <Label.Root htmlFor="bluetooth">Bluetooth</Label.Root>
      </div>
    </div>
  );
}
