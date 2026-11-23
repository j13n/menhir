// An app that uses every part of Menu but the submenus. Imports the
// compiled output, which is what a bundler without the `solid` condition
// gets.
import { Menu } from "../../../dist/menu/index.js";

console.log(
  Menu.Root,
  Menu.Trigger,
  Menu.Popup,
  Menu.Item,
  Menu.CheckboxItem,
  Menu.RadioGroup,
  Menu.RadioItem,
  Menu.ItemIndicator,
  Menu.Group,
  Menu.GroupLabel,
);
