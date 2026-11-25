import { Input } from "menhir/input";
import { Menu } from "menhir/menu";
import { Separator } from "menhir/separator";
import { ToggleGroup } from "menhir/toggle-group";
import { Toolbar } from "menhir/toolbar";
import { createSignal, For } from "solid-js";

export default function EditorToolbar() {
  const [link, setLink] = createSignal("");
  return (
    <Toolbar.Root aria-label="Editor">
      {/* The group holds the value; its items are the toolbar's. */}
      <ToggleGroup.Root aria-label="Alignment" defaultValue={["left"]}>
        <For each={["Left", "Center", "Right"]}>
          {(name) => (
            <Toolbar.Button
              render={(p) => (
                <ToggleGroup.Item {...p} value={name.toLowerCase()} />
              )}
            >
              {name}
            </Toolbar.Button>
          )}
        </For>
      </ToggleGroup.Root>
      <Separator.Root orientation="vertical" />
      {/* Opens on Down, Up, Enter and Space. */}
      <Menu.Root>
        <Toolbar.Button render={Menu.Trigger}>Font</Toolbar.Button>
        <Menu.Popup aria-label="Font">
          <Menu.Item>Serif</Menu.Item>
          <Menu.Item>Sans serif</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
      <Separator.Root orientation="vertical" />
      {/* Last, as the pattern advises: Left and Right move its caret. */}
      <Toolbar.Input
        aria-label="Link"
        render={(p) => (
          <Input.Root {...p} value={link()} onValueChange={setLink} />
        )}
      />
    </Toolbar.Root>
  );
}
