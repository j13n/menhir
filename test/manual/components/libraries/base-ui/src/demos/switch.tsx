import { Switch } from "@base-ui/react/switch";

export default function SwitchDemo() {
  return (
    <div className="stack">
      <label className="row">
        <Switch.Root className="switch">
          <Switch.Thumb className="switch-thumb" />
        </Switch.Root>
        Airplane mode
      </label>

      <label className="row">
        <Switch.Root className="switch" disabled>
          <Switch.Thumb className="switch-thumb" />
        </Switch.Root>
        Bluetooth
      </label>
    </div>
  );
}
