// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a bar with a closed "Edit" menu that has a submenu, and a
// "View" menu open by default, which the server renders closed (README,
// "Decisions").
import { Menubar } from "../../src/menubar/index.ts";

export default function MenubarFixture() {
  return (
    <Menubar.Root aria-label="Editor" data-testid="bar">
      <Menubar.Menu>
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menubar.Popup data-testid="edit">
          <Menubar.Item>Copy</Menubar.Item>
          <Menubar.Submenu>
            <Menubar.SubmenuTrigger>Share</Menubar.SubmenuTrigger>
            <Menubar.Popup data-testid="share">
              <Menubar.Item>Email</Menubar.Item>
            </Menubar.Popup>
          </Menubar.Submenu>
        </Menubar.Popup>
      </Menubar.Menu>
      <Menubar.Menu defaultOpen>
        <Menubar.Trigger>View</Menubar.Trigger>
        <Menubar.Popup data-testid="view">
          <Menubar.Item>Zoom in</Menubar.Item>
        </Menubar.Popup>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
