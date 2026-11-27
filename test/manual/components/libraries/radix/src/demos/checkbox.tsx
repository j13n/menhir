import { Checkbox, Label } from "radix-ui";

export default function CheckboxDemo() {
  return (
    <div className="stack">
      <div className="row">
        <Checkbox.Root className="box" id="terms">
          <Checkbox.Indicator className="check" />
        </Checkbox.Root>
        <Label.Root htmlFor="terms">Accept terms</Label.Root>
      </div>
      <div className="row">
        <Checkbox.Root className="box" id="all" defaultChecked="indeterminate">
          <Checkbox.Indicator className="check" />
        </Checkbox.Root>
        <Label.Root htmlFor="all">Select all</Label.Root>
      </div>
      <div className="row">
        <Checkbox.Root className="box" id="subscribe" disabled>
          <Checkbox.Indicator className="check" />
        </Checkbox.Root>
        <Label.Root htmlFor="subscribe">Subscribe</Label.Root>
      </div>
    </div>
  );
}
