import { ToggleGroup } from "@kobalte/core/toggle-group";

// Toggle Group has no label part, so the group's name is plain text.
export default function ToggleGroupDemo() {
  return (
    <>
      <div class="stack">
        <span>Text alignment</span>
        <ToggleGroup class="row" defaultValue="left">
          <ToggleGroup.Item class="toggle" value="left">
            Left
          </ToggleGroup.Item>
          <ToggleGroup.Item class="toggle" value="center">
            Center
          </ToggleGroup.Item>
          <ToggleGroup.Item class="toggle" value="right">
            Right
          </ToggleGroup.Item>
        </ToggleGroup>
      </div>

      <h2>Multiple</h2>
      <ToggleGroup class="row" multiple>
        <ToggleGroup.Item class="toggle" value="bold">
          Bold
        </ToggleGroup.Item>
        <ToggleGroup.Item class="toggle" value="italic">
          Italic
        </ToggleGroup.Item>
        <ToggleGroup.Item class="toggle" value="underline">
          Underline
        </ToggleGroup.Item>
      </ToggleGroup>
    </>
  );
}
