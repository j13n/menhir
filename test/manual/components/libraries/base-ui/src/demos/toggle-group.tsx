import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";

// The group has no label part; the docs name it with `aria-label`.
export default function ToggleGroupDemo() {
  return (
    <>
      <ToggleGroup
        aria-label="Text alignment"
        defaultValue={["left"]}
        className="row"
      >
        <Toggle value="left" className="toggle">
          Left
        </Toggle>
        <Toggle value="center" className="toggle">
          Center
        </Toggle>
        <Toggle value="right" className="toggle">
          Right
        </Toggle>
      </ToggleGroup>

      <h2>Multiple</h2>
      <ToggleGroup aria-label="Text style" multiple className="row">
        <Toggle value="bold" className="toggle">
          Bold
        </Toggle>
        <Toggle value="italic" className="toggle">
          Italic
        </Toggle>
        <Toggle value="underline" className="toggle">
          Underline
        </Toggle>
      </ToggleGroup>
    </>
  );
}
