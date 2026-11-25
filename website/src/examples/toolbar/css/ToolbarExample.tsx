import { Separator } from "menhir/separator";
import { Toggle } from "menhir/toggle";
import { Toolbar } from "menhir/toolbar";

import "./toolbar.css";

export default function ToolbarExample() {
  return (
    <Toolbar.Root aria-label="Text formatting" class="toolbar">
      <Toolbar.Button render={Toggle.Root} class="toolbar-item">
        Bold
      </Toolbar.Button>
      <Toolbar.Button render={Toggle.Root} class="toolbar-item">
        Italic
      </Toolbar.Button>
      <Separator.Root orientation="vertical" class="toolbar-separator" />
      <Toolbar.Button disabled class="toolbar-item">
        Undo
      </Toolbar.Button>
      <Toolbar.Link href="#keyboard" class="toolbar-item">
        Help
      </Toolbar.Link>
    </Toolbar.Root>
  );
}
