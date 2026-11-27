import { Label } from "radix-ui";

export default function LabelDemo() {
  return (
    <div className="stack">
      <Label.Root htmlFor="name">Name</Label.Root>
      <input id="name" />
    </div>
  );
}
