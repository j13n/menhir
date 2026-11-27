import { Toolbar } from "radix-ui";

// The toolbar has no label part; Radix's docs name it with `aria-label`.
export default function ToolbarDemo() {
  return (
    <Toolbar.Root className="row" aria-label="Formatting">
      <Toolbar.Button>Bold</Toolbar.Button>
      <Toolbar.Button>Italic</Toolbar.Button>
      <Toolbar.Separator className="separator" />
      <Toolbar.Link href="#">Help</Toolbar.Link>
      <Toolbar.ToggleGroup className="row" type="single">
        <Toolbar.ToggleItem className="toggle" value="left">
          Left
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem className="toggle" value="center">
          Center
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem className="toggle" value="right">
          Right
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>
    </Toolbar.Root>
  );
}
