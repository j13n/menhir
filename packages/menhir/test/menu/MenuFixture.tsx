// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a closed Menu with a submenu, and one open by default, which
// the server renders closed (README, "Decisions").
import { Menu } from "../../src/menu/index.ts";

export default function MenuFixture() {
  return (
    <>
      <Menu.Root>
        <Menu.Trigger>Edit</Menu.Trigger>
        <Menu.Popup data-testid="edit">
          <Menu.Item>Copy</Menu.Item>
          <Menu.CheckboxItem defaultChecked>
            <Menu.ItemIndicator />
            Word wrap
          </Menu.CheckboxItem>
          <Menu.Group>
            <Menu.GroupLabel>Sort</Menu.GroupLabel>
            <Menu.RadioGroup defaultValue="name">
              <Menu.RadioItem value="name">Name</Menu.RadioItem>
              <Menu.RadioItem value="date">Date</Menu.RadioItem>
            </Menu.RadioGroup>
          </Menu.Group>
          <Menu.Submenu>
            <Menu.SubmenuTrigger>Share</Menu.SubmenuTrigger>
            <Menu.Popup data-testid="share">
              <Menu.Item>Email</Menu.Item>
            </Menu.Popup>
          </Menu.Submenu>
        </Menu.Popup>
      </Menu.Root>
      <Menu.Root defaultOpen>
        <Menu.Trigger>View</Menu.Trigger>
        <Menu.Popup data-testid="view">
          <Menu.Item>Zoom in</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </>
  );
}
