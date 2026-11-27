import { ToggleGroup } from "radix-ui";

// The group has no label part; Radix's docs name it with `aria-label`.
export default function ToggleGroupDemo() {
  return (
    <>
      <ToggleGroup.Root
        className="row"
        type="single"
        defaultValue="left"
        aria-label="Text alignment"
      >
        <ToggleGroup.Item className="toggle" value="left">
          Left
        </ToggleGroup.Item>
        <ToggleGroup.Item className="toggle" value="center">
          Center
        </ToggleGroup.Item>
        <ToggleGroup.Item className="toggle" value="right">
          Right
        </ToggleGroup.Item>
      </ToggleGroup.Root>

      <h2>Multiple</h2>
      <ToggleGroup.Root className="row" type="multiple">
        <ToggleGroup.Item className="toggle" value="bold">
          Bold
        </ToggleGroup.Item>
        <ToggleGroup.Item className="toggle" value="italic">
          Italic
        </ToggleGroup.Item>
        <ToggleGroup.Item className="toggle" value="underline">
          Underline
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </>
  );
}
