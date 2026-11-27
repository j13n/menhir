import { Label, RadioGroup } from "radix-ui";

// The group has no label part; it is named by the visible label.
export default function RadioDemo() {
  return (
    <div className="stack">
      <span id="plan">Plan</span>
      <RadioGroup.Root
        className="stack"
        defaultValue="free"
        aria-labelledby="plan"
      >
        <div className="row">
          <RadioGroup.Item className="box round" value="free" id="free">
            <RadioGroup.Indicator className="dot" />
          </RadioGroup.Item>
          <Label.Root htmlFor="free">Free</Label.Root>
        </div>
        <div className="row">
          <RadioGroup.Item className="box round" value="pro" id="pro">
            <RadioGroup.Indicator className="dot" />
          </RadioGroup.Item>
          <Label.Root htmlFor="pro">Pro</Label.Root>
        </div>
        <div className="row">
          <RadioGroup.Item
            className="box round"
            value="enterprise"
            id="enterprise"
            disabled
          >
            <RadioGroup.Indicator className="dot" />
          </RadioGroup.Item>
          <Label.Root htmlFor="enterprise">Enterprise</Label.Root>
        </div>
      </RadioGroup.Root>
    </div>
  );
}
