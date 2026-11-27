import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toolbar } from "@base-ui/react/toolbar";

// The toolbar has no label part; the docs name it with `aria-label`.
export default function ToolbarDemo() {
  return (
    <Toolbar.Root aria-label="Formatting" className="toolbar">
      <Toolbar.Button>Bold</Toolbar.Button>
      <Toolbar.Button>Italic</Toolbar.Button>
      <Toolbar.Separator className="separator" />
      <Toolbar.Link href="#">Help</Toolbar.Link>
      <ToggleGroup defaultValue={["left"]} className="row">
        <Toolbar.Button render={<Toggle />} value="left" className="toggle">
          Left
        </Toolbar.Button>
        <Toolbar.Button render={<Toggle />} value="center" className="toggle">
          Center
        </Toolbar.Button>
        <Toolbar.Button render={<Toggle />} value="right" className="toggle">
          Right
        </Toolbar.Button>
      </ToggleGroup>
    </Toolbar.Root>
  );
}
