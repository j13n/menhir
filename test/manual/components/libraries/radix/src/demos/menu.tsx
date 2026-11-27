import { DropdownMenu } from "radix-ui";
import { useState } from "react";

export default function MenuDemo() {
  const [wrap, setWrap] = useState(false);
  const [theme, setTheme] = useState("light");
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="popup">
          <DropdownMenu.Item className="item">New file</DropdownMenu.Item>
          <DropdownMenu.Item className="item" disabled>
            Open
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="separator" />
          <DropdownMenu.CheckboxItem
            className="item"
            checked={wrap}
            onCheckedChange={setWrap}
          >
            <DropdownMenu.ItemIndicator className="mark" />
            Word wrap
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.Group>
            <DropdownMenu.Label className="group-label">
              Theme
            </DropdownMenu.Label>
            <DropdownMenu.RadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenu.RadioItem className="item" value="light">
                <DropdownMenu.ItemIndicator className="mark" />
                Light
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem className="item" value="dark">
                <DropdownMenu.ItemIndicator className="mark" />
                Dark
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Group>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className="item">
              Export
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent className="popup">
                <DropdownMenu.Item className="item">PDF</DropdownMenu.Item>
                <DropdownMenu.Item className="item">PNG</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
